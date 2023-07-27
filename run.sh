#!/bin/sh
cd client
npm run start &
cd ../server/TFC
python3 manage.py runserver 7893 &