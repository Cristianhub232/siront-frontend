import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

const CAMPOS_PERMITIDOS = [
  'RIF',
  'CONTRIBUYENTE',
  'REGION DE PROCEDENCIA',
  'DEPENDENCIA NUEVA',
  'OBSERVACIONES',
  'PROCEDENCIA',
];

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file || file.type !== 'text/csv') {
    return new NextResponse('Archivo inválido', { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder('latin1').decode(arrayBuffer); // 👈 esto evita caracteres raros

  const registros = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    quote: '"',
    relax_column_count: true,
  });

  const datosJSON = registros.map((row: Record<string, string>) => {
    const nuevaFila: Record<string, string> = {};

    for (const campo of CAMPOS_PERMITIDOS) {
      const claveReal = Object.keys(row).find(
        (key) => key.trim().toLowerCase() === campo.toLowerCase()
      );
      const valor = claveReal ? row[claveReal]?.trim() : '';
      nuevaFila[campo] = valor || 'Sin Asignar';
    }

    return nuevaFila;
  });

  return NextResponse.json(datosJSON);
}
