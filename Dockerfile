FROM node:22

WORKDIR /app

RUN apt-get update && apt-get install -y curl bash

RUN curl -L https://foundry.paradigm.xyz | bash && \
    /root/.foundry/bin/foundryup

ENV PATH="/root/.foundry/bin:$PATH"

RUN anvil --version

WORKDIR /app
COPY package*.json ./
RUN npm install


COPY . .

EXPOSE 3000

CMD ["npm", "run", "start-script"]
