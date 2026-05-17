
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const path = require("path");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";


app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
}


function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Немає токену авторизації" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Недійсний токен" });
  }
}


app.post("/api/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Всі поля обов'язкові" });
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email вже зареєстровано" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email та пароль обов'язкові" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Невірний email або пароль" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Невірний email або пароль" });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.get("/api/books", async (req, res) => {
  const { genre, search, page = 1, limit = 12 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const where = {};
  if (genre) where.genre = genre;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
    ];
  }
  try {
    const [books, total] = await Promise.all([
      prisma.book.findMany({ where, skip, take: Number(limit), orderBy: { createdAt: "desc" } }),
      prisma.book.count({ where }),
    ]);
    res.json({ books, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.get("/api/books/:id", async (req, res) => {
  try {
    const book = await prisma.book.findUnique({
      where: { id: Number(req.params.id) },
      include: { reviews: { include: { user: { select: { name: true } } } } },
    });
    if (!book) return res.status(404).json({ error: "Книгу не знайдено" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.post("/api/books", authMiddleware, async (req, res) => {
  const { title, author, price, description, cover, genre } = req.body;
  if (!title || !author || !price) {
    return res.status(400).json({ error: "Назва, автор та ціна обов'язкові" });
  }
  try {
    const book = await prisma.book.create({
      data: { title, author, price: Number(price), description, cover, genre },
    });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});




app.post("/api/orders", authMiddleware, async (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: "Кошик порожній" });
  }
  try {
    const books = await prisma.book.findMany({
      where: { id: { in: items.map((i) => i.bookId) } },
    });
    const totalPrice = items.reduce((sum, item) => {
      const book = books.find((b) => b.id === item.bookId);
      return sum + (book ? book.price * item.quantity : 0);
    }, 0);
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        totalPrice,
        items: {
          create: items.map((item) => {
            const book = books.find((b) => b.id === item.bookId);
            return { bookId: item.bookId, quantity: item.quantity, price: book.price };
          }),
        },
      },
      include: { items: { include: { book: true } } },
    });
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

app.get("/api/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { book: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});




app.post("/api/books/:id/reviews", authMiddleware, async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Рейтинг від 1 до 5" });
  }
  try {
    const review = await prisma.review.create({
      data: { userId: req.user.id, bookId: Number(req.params.id), rating: Number(rating), comment },
      include: { user: { select: { name: true } } },
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: "Помилка сервера" });
  }
});


app.post("/api/seed", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Заборонено у production" });
  }
  try {
    await prisma.book.createMany({
      data: [
        { title: "Кобзар", author: "Тарас Шевченко", price: 180, genre: "Поезія", description: "Збірка поетичних творів великого Кобзаря.", cover: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kobzar_1840.jpg/250px-Kobzar_1840.jpg" },
        { title: "Тіні забутих предків", author: "Михайло Коцюбинський", price: 220, genre: "Класика", description: "Повість про гуцульське кохання і трагедію.", cover: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Mykhailo_Kotsiubynsky.jpg/220px-Mykhailo_Kotsiubynsky.jpg" },
        { title: "Хіба ревуть воли, як ясла повні?", author: "Панас Мирний", price: 195, genre: "Класика", description: "Соціальний роман про долю українського селянина.", cover: null },
        { title: "Місто", author: "Валер'ян Підмогильний", price: 260, genre: "Проза", description: "Роман про молодого хлопця з села у місті.", cover: null },
        { title: "Дорошенко", author: "Іван Нечуй-Левицький", price: 175, genre: "Класика", description: "Повість про козацьку добу.", cover: null },
        { title: "Лісова пісня", author: "Леся Українка", price: 200, genre: "Драма", description: "Драма-феєрія про людину і природу.", cover: null },
      ],
      skipDuplicates: true,
    });
    res.json({ message: "Базу заповнено!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(` Сервер запущено на http://localhost:${PORT}`);
});