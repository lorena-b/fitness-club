#!/bin/sh
cd client
npm run start &
cd ../PB/TFC
python3 manage.py runserver 7893 &