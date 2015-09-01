#!/usr/bin/env bash

# Get latest commit of code, later in AWS will be able to
# decypher the version that was copied and running
# ------------------------------------------------------
LATEST_COMMIT_HASH=$(git log -n 1 --pretty=format:"%H")
BRANCH_NAME=$(git symbolic-ref --short HEAD)


# Prepare new folder that will contain copied app assets
# ------------------------------------------------------
set -e
rm -rf gitrepo4aws
mkdir -p gitrepo4aws


# Copy assets
# ------------------------------------------------------
cp -R .ebextensions gitrepo4aws/
cp -R .elasticbeanstalk gitrepo4aws/
cp -R client gitrepo4aws/
cp -R server gitrepo4aws/
cp package.json gitrepo4aws/
cp index.js gitrepo4aws/


# Enter directory
# ------------------------------------------------------
cd gitrepo4aws


# Initialize git repo which will be used to push code
# ------------------------------------------------------
git init
git config --global user.email "ivar.prudnikov@gmail.com"
git config --global user.name "Ivar Prudnikov"
git add -A .
git commit -m "from branch: ${BRANCH_NAME} from commit: ${LATEST_COMMIT_HASH}"
git tag "${BRANCH_NAME}.${LATEST_COMMIT_HASH}"


# Get AWS EB CLI, prepare config and use CLI to push app to Elastic Beanstalk
# http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html
# ------------------------------------------------------

curl -s https://s3.amazonaws.com/elasticbeanstalk-cli-resources/install-ebcli.py | python
~/.ebvenv/bin/eb deploy
