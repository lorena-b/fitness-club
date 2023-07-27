#!/bin/sh
cd client
npm install
cd ../PB/TFC
python3 -m venv venv
source venv/bin/activate
python3 -m install -r requirements.txt -e venv
pip3 install django
pip3 install certifi
pip3 install django-base64field
pip3 install djangorestframework-simplejwt
pip3 install pause
pip3 install setuptools
pip3 install wheel
pip3 install djangorestframework
pip3 install pillow
pip3 install datetime
pip3 install python-dateutil
pip3 install geopy
pip3 install django-cors-headers
python3 manage.py makemigrations
python3 manage.py migrate