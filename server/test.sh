for ip in $(seq 3000 3003)
do
    kill -9 $(lsof -ti :${ip})
done