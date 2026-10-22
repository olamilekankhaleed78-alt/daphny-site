# Deploy guide (beginner version)

## 1. Neon (database)
1. Sign up at https://neon.tech and create a project.
2. Click **Connect**, tick **Connection pooling**, and copy the connection string.

## 2. GitHub
1. Create a new empty repository at https://github.com/new
2. Upload all the files from this folder (drag and drop works: "uploading an existing file").

## 3. Vercel
1. Sign up at https://vercel.com with your GitHub account.
2. **Add New → Project**, pick your repository, then open **Environment Variables** and add:
   - `DATABASE_URL`  = the Neon string from step 1
   - `ADMIN_PASSWORD` = a long password only you know
   - `ADMIN_SESSION_SECRET` = any long random text (40+ characters)
3. Click **Deploy**.

## 4. First run
1. Open `https://YOUR-SITE.vercel.app/api/health` — you should see `{"ok":true}`. This creates the database tables.
2. Open `/admin`, log in, and add your hero photo URL in Settings.
