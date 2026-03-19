# ClinicBooking - Website Dat Lich Kham Benh Truc Tuyen

He thong dat lich kham benh truc tuyen danh cho phong kham, giup benh nhan de dang dat lich hen voi bac si chuyen khoa.

## Kien truc

Du an theo mo hinh **Client - Server**:

- **Client**: React (Vite) + Tailwind CSS
- **Server**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL

## Cau truc thu muc

```
CodeDoAnTotNghiep/
├── client/                    # Frontend - React + Vite + Tailwind CSS
│   └── src/
│       ├── components/        # Components dung chung (layout, ui)
│       ├── pages/             # Cac trang chinh
│       ├── services/          # Goi API (axios)
│       ├── hooks/             # Custom hooks
│       ├── context/           # React Context (auth, theme)
│       └── utils/             # Ham tien ich
│
├── server/                    # Backend - Express + Prisma
│   ├── src/
│   │   ├── config/            # Cau hinh
│   │   ├── controllers/       # Xu ly logic
│   │   ├── middlewares/       # Auth, error handling
│   │   ├── routes/            # Dinh tuyen API
│   │   ├── validators/        # Validate du lieu
│   │   └── utils/             # Ham tien ich
│   └── prisma/                # Prisma schema
│
└── README.md
```

## Yeu cau he thong

- **Node.js** >= 18
- **npm** >= 9
- **PostgreSQL** >= 14

## Cai dat

### 1. Clone du an

```bash
cd CodeDoAnTotNghiep
```

### 2. Cai dat Server

```bash
cd server
npm install
```

Tao file `.env` (hoac sua file `.env` co san) voi thong tin ket noi database:

```
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/clinic_booking?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
JWT_EXPIRES_IN="7d"
```

### 3. Cai dat Client

```bash
cd client
npm install
```

## Chay du an

### Chay Server (port 5000)

```bash
cd server
npm run dev
```

Kiem tra server hoat dong: truy cap `http://localhost:5000/api/health`

### Chay Client (port 3000)

```bash
cd client
npm run dev
```

Truy cap: `http://localhost:3000`

## Cong nghe su dung

### Frontend
| Cong nghe | Phien ban | Muc dich |
|---|---|---|
| React | 19 | UI Framework |
| Vite | 6 | Build tool |
| Tailwind CSS | 4 | Styling |
| React Router DOM | 7 | Routing |
| Axios | - | HTTP client |
| React Hook Form | - | Quan ly form |
| React Toastify | - | Thong bao |

### Backend
| Cong nghe | Phien ban | Muc dich |
|---|---|---|
| Express | 4 | Web framework |
| Prisma | 6 | ORM |
| JWT | - | Xac thuc |
| bcryptjs | - | Ma hoa mat khau |

## Tac gia

Do an tot nghiep - Truong Dai Hoc Mo Dia Chat Ha Noi
