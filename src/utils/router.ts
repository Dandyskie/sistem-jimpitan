export interface RouteState {
  section: 'petugas' | 'admin' | 'warga';
  wargaId?: string;
}

/**
 * Parsing path URL untuk membedakan Portal Petugas, Dashboard Admin, dan Portal Warga QR.
 */
export function parseAppRoute(pathname: string, search: string): RouteState {
  if (pathname.startsWith('/admin')) {
    return { section: 'admin' };
  }

  if (pathname.startsWith('/warga') || pathname.startsWith('/cek')) {
    const segments = pathname.split('/').filter(Boolean);
    const pathId = segments.length > 1 ? decodeURIComponent(segments[1]) : undefined;
    const queryId = new URLSearchParams(search).get('id') || undefined;
    return {
      section: 'warga',
      wargaId: pathId || queryId,
    };
  }

  return { section: 'petugas' };
}
