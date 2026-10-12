import React, { useState } from 'react';
import { Resident, ResidentStatus, TipeIuran, StatusBulanan } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { DataService } from '../../services/dataService';
import { WargaFormModal } from './warga/WargaFormModal';
import { WargaDetailModal } from './warga/WargaDetailModal';
import { WargaFilterToolbar } from './warga/WargaFilterToolbar';
import { WargaTable } from './warga/WargaTable';

interface DataWargaModuleProps {
  residents: Resident[];
  onAddResident: (resident: Omit<Resident, 'id'>) => void;
  onUpdateResident: (id: string, updates: Partial<Resident>) => void;
  onDeleteResident: (id: string) => void;
}

export const DataWargaModule: React.FC<DataWargaModuleProps> = ({
  residents,
  onAddResident,
  onUpdateResident,
  onDeleteResident,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [blockFilter, setBlockFilter] = useState('semua');
  const [tipeIuranFilter, setTipeIuranFilter] = useState<'semua' | 'bulanan' | 'harian'>('semua');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // State Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [viewingResident, setViewingResident] = useState<Resident | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State Form
  const [formNama, setFormNama] = useState('');
  const [formNoRumah, setFormNoRumah] = useState('');
  const [formBlok, setFormBlok] = useState('Blok A');
  const [formNoHp, setFormNoHp] = useState('');
  const [formStatus, setFormStatus] = useState<ResidentStatus>('aktif');
  const [formTipeIuran, setFormTipeIuran] = useState<TipeIuran>('harian');
  const [formNominalBulanan, setFormNominalBulanan] = useState<number>(20000);
  const [formCatatan, setFormCatatan] = useState('');

  const totalCount = residents.length;
  const monthlyCount = residents.filter((r) => r.tipe_iuran === 'bulanan').length;
  const dailyCount = totalCount - monthlyCount;

  const filteredResidents = residents.filter((r) => {
    const matchQuery =
      !searchQuery.trim() ||
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.noRumah.includes(searchQuery) ||
      r.blok.toLowerCase().includes(searchQuery.toLowerCase());

    const matchBlock = blockFilter === 'semua' || r.blok === blockFilter;
    const matchTipe =
      tipeIuranFilter === 'semua' ||
      (tipeIuranFilter === 'bulanan' && r.tipe_iuran === 'bulanan') ||
      (tipeIuranFilter === 'harian' && r.tipe_iuran !== 'bulanan');

    return matchQuery && matchBlock && matchTipe;
  });

  const handleOpenAdd = () => {
    setFormNama('');
    setFormNoRumah('');
    setFormBlok('Blok A');
    setFormNoHp('');
    setFormStatus('aktif');
    setFormTipeIuran('harian');
    setFormNominalBulanan(20000);
    setFormCatatan('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (res: Resident) => {
    setEditingResident(res);
    setFormNama(res.nama);
    setFormNoRumah(res.noRumah);
    setFormBlok(res.blok);
    setFormNoHp(res.noHp || '');
    setFormStatus(res.status);
    setFormTipeIuran(res.tipe_iuran || 'harian');
    setFormNominalBulanan(res.nominal_bulanan || 20000);
    setFormCatatan(res.catatan || '');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama || !formNoRumah) return;

    if (editingResident) {
      onUpdateResident(editingResident.id, {
        nama: formNama,
        noRumah: formNoRumah,
        blok: formBlok,
        noHp: formNoHp,
        status: formStatus,
        tipe_iuran: formTipeIuran,
        nominal_bulanan: formNominalBulanan,
        catatan: formCatatan,
      });
      setEditingResident(null);
      return;
    }

    onAddResident({
      nama: formNama,
      noRumah: formNoRumah,
      blok: formBlok,
      rt: '02',
      rw: '07',
      noHp: formNoHp,
      status: formStatus,
      statusPembayaranBulanIni: 'belum_bayar',
      totalKontribusi: 0,
      tipe_iuran: formTipeIuran,
      status_bulanan: 'belum_lunas',
      nominal_bulanan: formNominalBulanan,
      catatan: formCatatan,
    });
    setIsAddOpen(false);
  };

  const handleToggleBulananPayment = async (res: Resident) => {
    setIsProcessingId(res.id);
    const newStatus: StatusBulanan = res.status_bulanan === 'lunas' ? 'belum_lunas' : 'lunas';

    try {
      await DataService.updateWargaBulananStatus(
        res.id,
        newStatus,
        res.nama,
        res.nominal_bulanan || 20000
      );

      onUpdateResident(res.id, {
        status_bulanan: newStatus,
        statusBulanan: newStatus,
        statusPembayaranBulanIni: newStatus === 'lunas' ? 'lunas' : 'belum_bayar',
        statusTarikanMalamIni: newStatus === 'lunas' ? 'bulanan_lunas' : 'belum',
      });
    } catch (err) {
      console.error('Gagal memperbarui status bulanan:', err);
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <WargaFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        blockFilter={blockFilter}
        onBlockFilterChange={setBlockFilter}
        tipeIuranFilter={tipeIuranFilter}
        onTipeIuranFilterChange={setTipeIuranFilter}
        totalCount={totalCount}
        monthlyCount={monthlyCount}
        dailyCount={dailyCount}
        onOpenAdd={handleOpenAdd}
      />

      <WargaTable
        residents={filteredResidents}
        isProcessingId={isProcessingId}
        onToggleBulanan={handleToggleBulananPayment}
        onView={setViewingResident}
        onEdit={handleOpenEdit}
        onDelete={setDeletingId}
      />

      <WargaFormModal
        isOpen={isAddOpen || Boolean(editingResident)}
        onClose={() => {
          setIsAddOpen(false);
          setEditingResident(null);
        }}
        editingResident={editingResident}
        formNama={formNama}
        onNamaChange={setFormNama}
        formNoRumah={formNoRumah}
        onNoRumahChange={setFormNoRumah}
        formBlok={formBlok}
        onBlokChange={setFormBlok}
        formNoHp={formNoHp}
        onNoHpChange={setFormNoHp}
        formStatus={formStatus}
        onStatusChange={setFormStatus}
        formTipeIuran={formTipeIuran}
        onTipeIuranChange={setFormTipeIuran}
        formNominalBulanan={formNominalBulanan}
        onNominalBulananChange={setFormNominalBulanan}
        formCatatan={formCatatan}
        onCatatanChange={setFormCatatan}
        onSubmit={handleSubmitForm}
      />

      <WargaDetailModal
        resident={viewingResident}
        onClose={() => setViewingResident(null)}
      />

      <ConfirmModal
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            onDeleteResident(deletingId);
            setDeletingId(null);
          }
        }}
        title="Hapus Data Warga"
        message="Apakah Anda yakin ingin menghapus data warga ini dari sistem?"
        confirmText="Hapus Warga"
        variant="danger"
      />
    </div>
  );
};
