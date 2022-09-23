docker build -t budi-vvexpress .
docker tag  budi-vvexpress vevedh/budi-vvexpress:latest
docker push vevedh/budi-vvexpress:latest
docker run -p 9090:9090 --name=budi-sharepoint --hostname=localhost -it vevedh/budi-vvexpress
docker run -d -p 9090:9090 --name=budi-sharepoint --hostname=localhost vevedh/budi-vvexpress