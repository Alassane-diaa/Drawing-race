Install:

```bash
cd projet_ase
docker compose up --build
```

To turn off:

```bash
docker compose down
```
To reset databse (also reset the avatars !):

```bash
docker compose down -v
docker compose up --build
```

To turn on after a previous clean build:

```bash
docker compose up
```

To launch containers on background:

```bash
docker compose up -d
```

And to see the logs if necessary:
```bash
docker logs drawing-backend
```

If the containers are running then go on :

http://localhost:5173 

and enjoy :smile:
