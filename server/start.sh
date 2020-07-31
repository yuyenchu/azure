for ip in $(seq 3000 3003)
do
    lsof -i :${ip}  &> /dev/null && result=0 || result=1
    if [ "${result}" == 0 ]; then
        kill -9 $(lsof -ti :${ip})
done
node app.js & node eventListener.js & node stateListener.js & node twinListener.js