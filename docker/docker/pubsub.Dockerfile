FROM gcr.io/google.com/cloudsdktool/cloud-sdk:slim

RUN apt-get update && apt-get install -y \
    openjdk-17-jre-headless google-cloud-cli-pubsub-emulator \
  && rm -rf /var/lib/apt/lists/*

CMD ["gcloud","beta","emulators","pubsub","start","--project=local-dev","--host-port=0.0.0.0:8085"]