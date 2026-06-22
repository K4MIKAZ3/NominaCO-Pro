import { faqItems } from "@/lib/site";

export function FaqSection() {
  return (
    <section className="section faq-section" id="preguntas">
      <div className="container">
        <div className="section-title">
          <h2>Preguntas frecuentes</h2>
          <p>
            Respuestas rápidas antes de cotizar tu próximo proyecto de IA.
          </p>
        </div>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
