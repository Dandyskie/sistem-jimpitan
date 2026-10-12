import React, { useState } from 'react';
import { CashTransaction, TransactionType, TransactionCategory } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { formatRupiah, formatTanggalSingkat, getCategoryLabel } from '../../utils/formatters';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../data/financial-data';
import { Plus, Search, Trash2 } from 'lucide-react';
import { TransaksiFormModal } from './keuangan/TransaksiFormModal';

interface TransaksiKeuanganModuleProps {
  type: TransactionType;
  transactions: CashTransaction[];
  todayDate: string;
  onAddTransaction: (trx: Omit<CashTransaction, 'id' | 'waktuInput'>) => void;
  onDeleteTransaction: (id: string) => void;
}

/**
 * Modul Catatan Transaksi Keuangan (Pemasukan & Pengeluaran Kas RT).
 */
export const TransaksiKeuanganModule: React.FC<TransaksiKeuanganModuleProps> = ({
  type,
  transactions,
  todayDate,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const isIncome = type === 'pemasukan';
  const categoryOptions = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State formulir input transaksi
  const [deskripsi, setDeskripsi] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState<TransactionCategory>(categoryOptions[0].value);
  const [tanggal, setTanggal] = useState(todayDate);
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [catatan, setCatatan] = useState('');

  const filtered = transactions.filter((t) => {
    if (t.tipe !== type) return false;

    const q = searchQuery.toLowerCase().trim();
    const pj = t.penanggungJawab || t.penanggung_jawab || '';
    const matchQuery =
      !q ||
      t.deskripsi.toLowerCase().includes(q) ||
      pj.toLowerCase().includes(q) ||
      (t.catatan && t.catatan.toLowerCase().includes(q));

    const matchCategory = selectedCategory === 'semua' || t.kategori === selectedCategory;
    return matchQuery && matchCategory;
  });

  const totalAmount = filtered.reduce((sum, t) => sum + t.nominal, 0);

  const handleOpenAdd = () => {
    setDeskripsi('');
    setNominal('');
    setKategori(categoryOptions[0].value);
    setTanggal(todayDate);
    setPenanggungJawab(isIncome ? 'Bendahara (Bpk. Mulyadi)' : 'Petugas Ronda (Bpk. Sutrisno)');
    setCatatan('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deskripsi || !nominal || !penanggungJawab) return;

    onAddTransaction({
      tipe: type,
      kategori,
      deskripsi,
      nominal: Number(nominal),
      tanggal,
      penanggungJawab,
      catatan,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
              {isIncome ? 'Buku Catatan Pemasukan Kas RT' : 'Buku Catatan Pengeluaran Kas RT'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Total {isIncome ? 'Pemasukan' : 'Pengeluaran'} Terfilter:{' '}
              <strong className={isIncome ? 'text-[var(--color-primary)]' : 'text-rose-700'}>
                {formatRupiah(totalAmount)}
              </strong>{' '}
              ({filtered.length} transaksi)
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className={`h-10 px-4 rounded-[var(--radius-sm)] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center shadow-xs active:scale-[0.98] ${
              isIncome
                ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isIncome ? 'Catat Pemasukan Baru' : 'Catat Pengeluaran Baru'}</span>
          </button>
        </div>

        <div className="pt-3 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full h-9 pl-8 pr-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-disabled)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-shadow"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            <option value="semua">Semua Kategori</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabel Data Transaksi */}
      <div className="bg-[var(--color-surface)] rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border)] text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Tanggal</th>
              <th className="py-3 px-4">Deskripsi</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Penanggung Jawab</th>
              <th className="py-3 px-4 text-right">Nominal</th>
              <th className="py-3 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((tx) => (
              <tr key={tx.id} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                <td className="py-3.5 px-4 text-[var(--color-text-secondary)] font-mono text-[11px]">
                  {formatTanggalSingkat(tx.tanggal)}
                </td>
                <td className="py-3.5 px-4 font-bold text-[var(--color-text-primary)]">
                  {tx.deskripsi}
                  {tx.catatan && <span className="block text-[11px] text-[var(--color-text-secondary)] font-normal">{tx.catatan}</span>}
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                    {getCategoryLabel(tx.kategori)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-[var(--color-text-secondary)]">
                  {tx.penanggungJawab || tx.penanggung_jawab || '-'}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`font-mono font-bold tabular-nums ${
                      isIncome ? 'text-[var(--color-primary)]' : 'text-rose-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatRupiah(tx.nominal)}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setDeletingId(tx.id)}
                    className="p-1.5 text-[var(--color-text-disabled)] hover:text-rose-600 hover:bg-rose-50 rounded-[var(--radius-sm)] transition-colors cursor-pointer"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TransaksiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
        categoryOptions={categoryOptions}
        deskripsi={deskripsi}
        onDeskripsiChange={setDeskripsi}
        nominal={nominal}
        onNominalChange={setNominal}
        kategori={kategori}
        onKategoriChange={setKategori}
        tanggal={tanggal}
        onTanggalChange={setTanggal}
        penanggungJawab={penanggungJawab}
        onPenanggungJawabChange={setPenanggungJawab}
        catatan={catatan}
        onCatatanChange={setCatatan}
        onSubmit={handleSave}
      />

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteTransaction(deletingId);
            setDeletingId(null);
          }
        }}
        title="Hapus Transaksi Kas"
        message="Apakah Anda yakin ingin menghapus catatan transaksi ini dari buku kas?"
        confirmText="Hapus Transaksi"
        variant="danger"
      />
    </div>
  );
};
