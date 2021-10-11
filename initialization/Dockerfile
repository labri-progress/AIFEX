FROM node as builder

# install python (needed by npm-gyp)
RUN apt-get update && apt-get install python make gcc g++ -y


# Create app directory
WORKDIR /app

COPY ./package.json /app/package.json
RUN npm install

# Install app dependencies
RUN npm install -g typescript

COPY ./tsconfig.json /app

COPY ./src /app/src

RUN tsc



FROM node

# Set the working directory to /app
WORKDIR /app

# Install any needed packages specified in requirements.txt=

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY ./package.json /app/package.json
COPY ./mapping /app/mapping
COPY ./explorations /app/explorations


# Run when the container launches
CMD npm start
