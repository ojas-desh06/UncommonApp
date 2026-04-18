import PDFDocument from "pdfkit";
import { createWriteStream, mkdirSync } from "node:fs";

const OUTPUT = "data/test-essay.pdf";
mkdirSync("data", { recursive: true });

const essay = `My obsession started with a broken microwave. I was nine, and I took it apart on the kitchen floor to figure out why the turntable had stopped spinning. My mom found me with the magnetron on the tile and a very specific expression on her face. I did not get the microwave working again, but I did get grounded, and I got something else too — the understanding that the difference between things that worked and things that didn't wasn't magic. It was a chain of small decisions, each one legible if you were willing to look.

That instinct is what pulled me into computer science. When I built my tutoring platform, the first version crashed every time more than three people logged on. I spent a weekend reading about connection pooling, rewrote the database layer, and watched the error rate drop to zero. That moment — the one where abstractions resolve into something concrete — still feels to me like the best thing a job can offer.

I want to spend my life chasing that feeling, but pointed outward. My research at UCLA was the first time I saw code do something I couldn't do with my own mind: predict the folded structure of a protein I'd never seen. It made me want to work on problems that are actually hard, with people who are smarter than me, in rooms where I'm the youngest person there. That is what I hope college will give me, and what I hope I can give back.`;

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 72, bottom: 72, left: 72, right: 72 },
  info: { Title: "Personal Essay", Author: "Test Applicant" },
});

doc.pipe(createWriteStream(OUTPUT));

doc
  .font("Times-Bold")
  .fontSize(14)
  .text("Personal Essay", { align: "center" });

doc.moveDown(1.5);

doc
  .font("Times-Roman")
  .fontSize(12)
  .text(essay, { align: "left", lineGap: 4, paragraphGap: 8 });

doc.end();

console.log(`Wrote ${OUTPUT}`);
