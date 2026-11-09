-- Foto de los platos del día. El formulario del panel ya permitía subirla, pero la tabla no tenía
-- dónde guardarla y la API la descartaba.
ALTER TABLE daily_specials ADD COLUMN image TEXT;
