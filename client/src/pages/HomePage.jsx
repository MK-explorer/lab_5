// src/pages/HomePage.jsx
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>КнигаЛенд</h1>
          <p className={styles.heroSub}>
            Найкращі книги українських та світових авторів з доставкою до вашого дому
          </p>
          <Link to="/catalog" className={styles.heroBtn}>
            Перейти до каталогу
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📚</span>
          <h3>Великий вибір</h3>
          <p>Тисячі книг різних жанрів — від класики до сучасної літератури</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🚚</span>
          <h3>Швидка доставка</h3>
          <p>Доставляємо по всій Україні протягом 2-3 робочих днів</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>💳</span>
          <h3>Зручна оплата</h3>
          <p>Оплата карткою, готівкою або при отриманні</p>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2>Готові обрати книгу?</h2>
        <p>Заходьте до каталогу та знайдіть свою наступну улюблену книгу</p>
        <Link to="/catalog" className={styles.ctaBtn}>Дивитись каталог</Link>
      </section>
    </div>
  );
}