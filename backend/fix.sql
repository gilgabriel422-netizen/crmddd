UPDATE usuarios SET email = '0005@cliente.crm.com' WHERE email LIKE '%KMPRY SDSD%';
SELECT id, nombre, email FROM usuarios WHERE email LIKE '%0005%';
