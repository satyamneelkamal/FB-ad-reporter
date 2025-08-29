#!/bin/bash
# Direct SQL update to fix client-user relationship

curl -s -X PUT "http://localhost:3000/api/admin/clients?id=9" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"efd82a79-d304-4bdd-815a-8e73765bee1d"}' \
  -b /tmp/admin-cookies.txt

echo
echo "Client-user link update attempted"