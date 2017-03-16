cd ~/code/api-docs
git pull
yaml2json docs.yaml > docs.json
forever restart swagScript
