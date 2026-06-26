import { universities, subjects } from "../data.js";

export const homeView = () => `
  <section class="hero">
    <span class="badge badge-primary" style="margin-bottom:16px">სტუდენტებისთვის</span>
    <h1>იპოვე <span class="text-gradient">საუკეთესო</span><br/>უნივერსიტეტი და საგანი</h1>
    <p>აღმოაჩინე უნივერსიტეტები, ფაკულტეტები და საგნები. შეაფასე ლექტორები, გააზიარე რესურსები და მართე გამოცდის კალენდარი.</p>
    <div class="row" style="justify-content:center">
      <a href="#/universities" class="btn btn-primary">დაიწყე ძიება →</a>
      <a href="#/rankings" class="btn">რეიტინგი</a>
    </div>
  </section>

  <div class="grid grid-4">
    <div class="card stat"><div class="stat-num text-gradient">${universities.length}</div><div class="stat-label">უნივერსიტეტი</div></div>
    <div class="card stat"><div class="stat-num text-gradient">${subjects.length}+</div><div class="stat-label">საგანი</div></div>
    <div class="card stat"><div class="stat-num text-gradient">120+</div><div class="stat-label">ლექტორი</div></div>
    <div class="card stat"><div class="stat-num text-gradient">500+</div><div class="stat-label">სტუდენტი</div></div>
  </div>

  <h2 class="section-title">რას შემოგთავაზებთ</h2>
  <div class="grid grid-3">
    <a class="card" href="#/universities"><h3>🎓 უნივერსიტეტები</h3><p>დეტალური ინფორმაცია ფაკულტეტებსა და საგნებზე.</p></a>
    <a class="card" href="#/search"><h3>🔍 გაფართოებული ძიება</h3><p>ფილტრები კრედიტით, ლექტორით, ფაკულტეტით და ტიპით.</p></a>
    <a class="card" href="#/lecturers"><h3>👨‍🏫 ლექტორები</h3><p>გადახედე ლექტორების შეფასებებსა და გამოცდილებას.</p></a>
    <a class="card" href="#/profile"><h3>🏆 ბეჯები & ქულები</h3><p>აქშენებზე იღებ ქულებს და ხსნი ბეჯებს.</p></a>
    <a class="card" href="#/calendar"><h3>📅 გამოცდის კალენდარი</h3><p>დაიმახსოვრე ვადები და მზადყოფნა.</p></a>
    <a class="card" href="#/faq"><h3>❓ FAQ</h3><p>აკადემიური პროცესის ხშირად დასმული კითხვები.</p></a>
  </div>
`;
