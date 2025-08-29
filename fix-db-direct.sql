-- Update client ID 9 to link with user ankur@fotoplane.com
UPDATE clients 
SET user_id = 'efd82a79-d304-4bdd-815a-8e73765bee1d' 
WHERE id = 9;

-- Verify the update
SELECT id, name, slug, user_id, status 
FROM clients 
WHERE id = 9;