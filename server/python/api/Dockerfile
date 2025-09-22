FROM hdgigante/python-opencv:4.12.0-alpine

RUN apk add --update --no-cache python3 py3-pip tzdata ca-certificates \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo Asia/Shanghai > /etc/timezone \
    && rm -rf /var/cache/apk/*

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt

RUN pip install --upgrade pip --break-system-packages \
    && pip install --user -r requirements.txt --break-system-packages

COPY . /app

CMD ["python3", "app.py"]
