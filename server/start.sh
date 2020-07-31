for ip in $(seq 3000 3003)
do
    kill -9 $(lsof -ti :${ip})
done
node app.js & node eventListener.js & node stateListener.js & node twinListener.js