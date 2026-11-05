// The course this page is for: {id, name, ai, url, langs, topics}, from courses/<id>/course.json, which the build writes
// into the page as <script type="application/json" id="course">. Outside a page (the Node tests) it's CS 61A.
import CS61A from '../../courses/61a/course.json' with { type: 'json' };

const tag = globalThis.document?.getElementById('course');
export const COURSE = tag ? JSON.parse(tag.textContent) : CS61A;
// Browser storage names. Each course keeps its own, so two courses' sites never share saved answers.
export const storageKey = name => `cs${COURSE.id}-${name}`;
// Whether the course has a language that runs (and so a playground).
export const hasPlayground = COURSE.langs.length > 0;
// The course's languages for a sentence: langNames('and') is "Python and Gleam".
const NAMES = { py: 'Python', gleam: 'Gleam' };
export const langNames = conj => COURSE.langs.map(l => NAMES[l]).join(` ${conj} `);
