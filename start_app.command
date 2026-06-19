#!/bin/bash
cd "$(dirname "$0")"
pip3 install flask --quiet
python3 web_app.py
