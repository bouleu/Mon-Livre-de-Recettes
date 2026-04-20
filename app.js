const SUPABASE_URL = “https://guloagtocokotjvwcchu.supabase.co”;
const SUPABASE_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bG9hZ3RvY29rb3RqdndjY2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzA1ODcsImV4cCI6MjA5MjE0NjU4N30.QXAKN5cig5Di-0XVoB-vk0WohjhrQdn9VjZlW_mJEqU”;

const db = {
getAll: function() {
return fetch(SUPABASE_URL + “/rest/v1/recipes?order=created_at.desc”, {
headers: { apikey: SUPABASE_KEY, Authorization: “Bearer “ + SUPABASE_KEY }
}).then(function(r) { return r.json(); });
},
insert: function(recipe) {
return fetch(SUPABASE_URL + “/rest/v1/recipes”, {
method: “POST”,
headers: { apikey: SUPABASE_KEY, Authorization: “Bearer “ + SUPABASE_KEY, “Content-Type”: “application/json”, Prefer: “return=representation” },
body: JSON.stringify(recipe)
}).then(function(r) { return r.json(); }).then(function(d) { return d[0]; });
},
update: function(id, recipe) {
return fetch(SUPABASE_URL + “/rest/v1/recipes?id=eq.” + id, {
method: “PATCH”,
headers: { apikey: SUPABASE_KEY, Authorization: “Bearer “ + SUPABASE_KEY, “Content-Type”: “application/json”, Prefer: “return=representation” },
body: JSON.stringify(recipe)
}).then(function(r) { return r.json(); }).then(function(d) { return d[0]; });
},
remove: function(id) {
return fetch(SUPABASE_URL + “/rest/v1/recipes?id=eq.” + id, {
method: “DELETE”,
headers: { apikey: SUPABASE_KEY, Authorization: “Bearer “ + SUPABASE_KEY }
});
}
};

const LANG = {
en: {
title: “My Recipe Book”, search: “Search recipes…”, all: “All”, add: “Add Recipe”,
edit: “Edit”, del: “Delete”, save: “Save”, cancel: “Cancel”,
recipeName: “Recipe name”, category: “Category”, prepTime: “Prep time”,
cookTime: “Cook time”, servings: “Servings”, ingredients: “Ingredients”,
instructions: “Instructions”, notes: “Notes (optional)”,
noRecipes: “No recipes yet.”, addFirst: “Add your first recipe!”,
noMatch: “No recipes match.”, confirmDelete: “Delete this recipe?”,
min: “min”, serves: “serves”, loading: “Loading…”, saving: “Saving…”,
categories: [“Italian”, “French”, “Asian”, “Desserts”, “Baking”]
},
fr: {
title: “Mon Livre de Recettes”, search: “Rechercher…”, all: “Tout”, add: “Ajouter”,
edit: “Modifier”, del: “Supprimer”, save: “Enregistrer”, cancel: “Annuler”,
recipeName: “Nom de la recette”, category: “Categorie”, prepTime: “Prep.”,
cookTime: “Cuisson”, servings: “Portions”, ingredients: “Ingredients”,
instructions: “Instructions”, notes: “Notes (facultatif)”,
noRecipes: “Aucune recette.”, addFirst: “Ajoutez votre premiere recette!”,
noMatch: “Aucune recette trouvee.”, confirmDelete: “Supprimer cette recette?”,
min: “min”, serves: “portions”, loading: “Chargement…”, saving: “Enregistrement…”,
categories: [“Italienne”, “Francaise”, “Asiatique”, “Desserts”, “Patisserie”]
}
};

const CAT_ICONS = { Italian:“🍝”, Italienne:“🍝”, French:“🥐”, Francaise:“🥐”, Asian:“🍜”, Asiatique:“🍜”, Desserts:“🍮”, Baking:“🍞”, Patisserie:“🍞” };
const CAT_COLORS = { Italian:”#c0392b”, Italienne:”#c0392b”, French:”#2c3e8c”, Francaise:”#2c3e8c”, Asian:”#e67e22”, Asiatique:”#e67e22”, Desserts:”#8e44ad”, Baking:”#c0873f”, Patisserie:”#c0873f” };

function toDb(f) {
return { name: f.name, name_fr: f.nameFr, category: f.category, category_fr: f.categoryFr, prep_time: f.prepTime ? parseInt(f.prepTime) : null, cook_time: f.cookTime ? parseInt(f.cookTime) : null, servings: f.servings ? parseInt(f.servings) : null, ingredients: f.ingredients, ingredients_fr: f.ingredientsFr, instructions: f.instructions, instructions_fr: f.instructionsFr, notes: f.notes, notes_fr: f.notesFr };
}
function fromDb(r) {
return { id: r.id, name: r.name, nameFr: r.name_fr, category: r.category, categoryFr: r.category_fr, prepTime: r.prep_time, cookTime: r.cook_time, servings: r.servings, ingredients: r.ingredients, ingredientsFr: r.ingredients_fr, instructions: r.instructions, instructionsFr: r.instructions_fr, notes: r.notes, notesFr: r.notes_fr };
}
function emptyForm() {
return { id: null, name: “”, nameFr: “”, category: “”, categoryFr: “”, prepTime: “”, cookTime: “”, servings: “”, ingredients: “”, ingredientsFr: “”, instructions: “”, instructionsFr: “”, notes: “”, notesFr: “” };
}
function catColor(cat) { return CAT_COLORS[cat] || “#555”; }
function catIcon(cat) { return CAT_ICONS[cat] || “🍽️”; }

var state = {
lang: “en”, recipes: [], loading: true, saving: false,
search: “”, activeCategory: “all”, view: “grid”,
selected: null, form: emptyForm(), editMode: false,
deleteConfirm: null, formLang: “en”
};

function t() { return LANG[state.lang]; }
function allEn() { return LANG.en.categories; }
function allFr() { return LANG.fr.categories; }

function displayName(r) { return state.lang === “en” ? r.name : (r.nameFr || r.name); }
function displayCat(r) { return state.lang === “en” ? r.category : (r.categoryFr || r.category); }
function displayIng(r) { return state.lang === “en” ? r.ingredients : (r.ingredientsFr || r.ingredients); }
function displayIns(r) { return state.lang === “en” ? r.instructions : (r.instructionsFr || r.instructions); }
function displayNotes(r) { return state.lang === “en” ? r.notes : (r.notesFr || r.notes); }

function setState(updates) {
Object.assign(state, updates);
render();
}

function render() {
var app = document.getElementById(“app”);
var lang = t();
var filtered = state.recipes.filter(function(r) {
var name = displayName(r) || “”;
var matchSearch = name.toLowerCase().indexOf(state.search.toLowerCase()) >= 0 || (r.ingredients || “”).toLowerCase().indexOf(state.search.toLowerCase()) >= 0;
var matchCat = state.activeCategory === “all” || r.category === state.activeCategory;
return matchSearch && matchCat;
});

var html = ‘<div style="min-height:100vh;background:#faf7f2;font-family:Georgia,serif;color:#2a2018">’;

// Header
html += ‘<header style="background:#1c1207;position:sticky;top:0;z-index:100;box-shadow:0 2px 20px rgba(0,0,0,0.3)">’;
html += ‘<div style="max-width:900px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;height:64px">’;
html += ‘<div style="display:flex;align-items:center;gap:12px">’;
if (state.view !== “grid”) {
html += ‘<button onclick="goBack()" style="background:none;border:none;color:#f0c97a;cursor:pointer;font-size:20px;padding:0 8px 0 0">←</button>’;
}
html += ’<span style="font-size:22px;font-weight:bold;color:#f0c97a;letter-spacing:1px">📖 ’ + lang.title + ‘</span>’;
html += ‘</div>’;
html += ‘<div style="display:flex;gap:8px">’;
html += ‘<button onclick=“setLang('en')” style=“padding:4px 12px;border-radius:20px;border:none;cursor:pointer;background:’ + (state.lang === “en” ? “#f0c97a” : “transparent”) + ‘;color:’ + (state.lang === “en” ? “#1c1207” : “#f0c97a”) + ‘;font-weight:bold;font-size:13px”>EN</button>’;
html += ‘<button onclick=“setLang('fr')” style=“padding:4px 12px;border-radius:20px;border:none;cursor:pointer;background:’ + (state.lang === “fr” ? “#f0c97a” : “transparent”) + ‘;color:’ + (state.lang === “fr” ? “#1c1207” : “#f0c97a”) + ‘;font-weight:bold;font-size:13px”>FR</button>’;
html += ‘</div></div></header>’;

html += ‘<div style="max-width:900px;margin:0 auto;padding:24px 16px">’;

if (state.loading) {
html += ‘<div style="text-align:center;padding:80px 20px;color:#9a8a6a"><div style="font-size:48px;margin-bottom:16px">⏳</div><p style="font-size:18px">’ + lang.loading + ‘</p></div>’;
} else if (state.view === “grid”) {
html += ‘<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">’;
html += ‘<input id="search" value="' + state.search + '" oninput="setSearch(this.value)" placeholder="' + lang.search + '" style="flex:1;min-width:200px;padding:10px 16px;border-radius:10px;border:2px solid #e0d5c0;background:#fff;font-size:15px;font-family:Georgia,serif;outline:none">’;
html += ’<button onclick="openAdd()" style="background:#c0392b;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-weight:bold;font-size:15px;cursor:pointer;font-family:Georgia,serif;white-space:nowrap">+ ’ + lang.add + ‘</button>’;
html += ‘</div>’;

```
html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">';
html += '<button onclick="setCat(\'all\')" style="padding:6px 16px;border-radius:20px;border:2px solid ' + (state.activeCategory === "all" ? "#1c1207" : "#c8baa0") + ';background:' + (state.activeCategory === "all" ? "#1c1207" : "#fff") + ';color:' + (state.activeCategory === "all" ? "#f0c97a" : "#5a4a30") + ';cursor:pointer;font-family:Georgia,serif;font-weight:bold;font-size:13px">' + lang.all + '</button>';
allEn().forEach(function(cat, i) {
  var frCat = allFr()[i];
  var label = state.lang === "en" ? cat : frCat;
  var active = state.activeCategory === cat;
  html += '<button onclick="setCat(\'' + cat + '\')" style="padding:6px 16px;border-radius:20px;border:2px solid ' + (active ? catColor(cat) : "#c8baa0") + ';background:' + (active ? catColor(cat) : "#fff") + ';color:' + (active ? "#fff" : "#5a4a30") + ';cursor:pointer;font-family:Georgia,serif;font-size:13px">' + catIcon(cat) + ' ' + label + '</button>';
});
html += '</div>';

if (filtered.length === 0) {
  html += '<div style="text-align:center;padding:60px 20px;color:#9a8a6a"><div style="font-size:48px;margin-bottom:16px">🍽️</div><p style="font-size:18px">' + (state.search ? lang.noMatch : lang.noRecipes) + '</p>';
  if (!state.search) html += '<button onclick="openAdd()" style="margin-top:12px;background:#c0392b;color:#fff;border:none;border-radius:10px;padding:10px 24px;cursor:pointer;font-family:Georgia,serif;font-size:15px">+ ' + lang.addFirst + '</button>';
  html += '</div>';
} else {
  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px">';
  filtered.forEach(function(r) {
    html += '<div onclick="openDetail(\'' + r.id + '\')" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);cursor:pointer;border:1px solid #ece5d8">';
    html += '<div style="background:' + catColor(r.category) + ';padding:20px 20px 14px;position:relative">';
    html += '<div style="font-size:36px">' + catIcon(r.category) + '</div>';
    html += '<div style="position:absolute;top:12px;right:12px;background:rgba(255,255,255,0.2);border-radius:20px;padding:2px 10px;font-size:11px;color:#fff;font-weight:bold">' + displayCat(r) + '</div>';
    html += '</div><div style="padding:16px 18px 18px">';
    html += '<h3 style="margin:0 0 8px;font-size:17px;line-height:1.3;color:#1c1207">' + (displayName(r) || "") + '</h3>';
    html += '<div style="display:flex;gap:14px;color:#9a8a6a;font-size:13px">';
    if (r.prepTime) html += '<span>⏱ ' + r.prepTime + lang.min + '</span>';
    if (r.servings) html += '<span>👥 ' + r.servings + ' ' + lang.serves + '</span>';
    html += '</div></div></div>';
  });
  html += '</div>';
}
```

} else if (state.view === “detail” && state.selected) {
var r = state.selected;
html += ‘<div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);border:1px solid #ece5d8">’;
html += ‘<div style="background:' + catColor(r.category) + ';padding:32px 32px 24px;display:flex;justify-content:space-between;align-items:flex-start">’;
html += ‘<div><div style="font-size:48px;margin-bottom:8px">’ + catIcon(r.category) + ‘</div>’;
html += ‘<h2 style="margin:0;color:#fff;font-size:26px;line-height:1.2">’ + (displayName(r) || “”) + ‘</h2>’;
if (state.lang === “en” && r.nameFr) html += ‘<p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:15px;font-style:italic">’ + r.nameFr + ‘</p>’;
html += ‘<span style="display:inline-block;margin-top:10px;background:rgba(255,255,255,0.2);border-radius:20px;padding:3px 14px;color:#fff;font-size:13px">’ + displayCat(r) + ‘</span></div>’;
html += ‘<div style="display:flex;gap:8px">’;
html += ’<button onclick="openEdit(\'' + r.id + '\')" style="background:rgba(255,255,255,0.2);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:Georgia,serif;font-size:14px">✏️ ’ + lang.edit + ‘</button>’;
html += ‘<button onclick="confirmDelete(\'' + r.id + '\')" style="background:rgba(255,255,255,0.2);color:#fff;border:none;border-radius:8px;padding:8px 16px;cursor:pointer;font-family:Georgia,serif;font-size:14px">🗑️</button>’;
html += ‘</div></div>’;
html += ‘<div style="padding:24px 32px">’;
html += ‘<div style="display:flex;gap:24px;margin-bottom:28px;flex-wrap:wrap">’;
if (r.prepTime) html += ‘<div style="text-align:center"><div style="font-size:22px">⏱️</div><div style="font-size:13px;color:#9a8a6a">’ + lang.prepTime + ‘</div><div style="font-weight:bold;font-size:16px">’ + r.prepTime + ’ ’ + lang.min + ‘</div></div>’;
if (r.cookTime) html += ‘<div style="text-align:center"><div style="font-size:22px">🔥</div><div style="font-size:13px;color:#9a8a6a">’ + lang.cookTime + ‘</div><div style="font-weight:bold;font-size:16px">’ + r.cookTime + ’ ’ + lang.min + ‘</div></div>’;
if (r.servings) html += ‘<div style="text-align:center"><div style="font-size:22px">👥</div><div style="font-size:13px;color:#9a8a6a">’ + lang.servings + ‘</div><div style="font-weight:bold;font-size:16px">’ + r.servings + ‘</div></div>’;
html += ‘</div>’;
if (displayIng(r)) {
html += ’<div style="margin-bottom:24px"><h4 style="color:' + catColor(r.category) + ';font-size:16px;margin-bottom:12px;border-bottom:2px solid ' + catColor(r.category) + ';padding-bottom:6px">🛒 ’ + lang.ingredients + ‘</h4><ul style="margin:0;padding-left:20px">’;
displayIng(r).split(”\n”).filter(Boolean).forEach(function(ing) { html += ‘<li style="margin-bottom:6px;font-size:15px;line-height:1.5">’ + ing + ‘</li>’; });
html += ‘</ul></div>’;
}
if (displayIns(r)) {
html += ’<div style="margin-bottom:24px"><h4 style="color:' + catColor(r.category) + ';font-size:16px;margin-bottom:12px;border-bottom:2px solid ' + catColor(r.category) + ';padding-bottom:6px">📋 ’ + lang.instructions + ‘</h4>’;
html += ‘<div style="line-height:1.8;font-size:15px;white-space:pre-line">’ + displayIns(r) + ‘</div></div>’;
}
if (displayNotes(r)) {
html += ‘<div style="background:#faf7f2;border-radius:10px;padding:14px 18px;border-left:4px solid ' + catColor(r.category) + '">’;
html += ’<h4 style="margin:0 0 6px;font-size:14px;color:#9a8a6a">💡 ’ + lang.notes + ‘</h4>’;
html += ‘<p style="margin:0;font-size:14px;line-height:1.6;font-style:italic">’ + displayNotes(r) + ‘</p></div>’;
}
html += ‘</div></div>’;
} else if (state.view === “form”) {
var f = state.form;
html += ‘<div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.10);border:1px solid #ece5d8">’;
html += ‘<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">’;
html += ‘<h2 style="margin:0;font-size:20px">’ + (state.editMode ? “✏️ “ + lang.edit : “+ “ + lang.add) + ‘</h2>’;
html += ‘<div style="display:flex;gap:8px">’;
html += ’<button onclick=“setFormLang('en')” style=“padding:4px 12px;border-radius:20px;border:2px solid ’ + (state.formLang === “en” ? “#1c1207” : “#c8baa0”) + ‘;background:’ + (state.formLang === “en” ? “#1c1207” : “#fff”) + ‘;color:’ + (state.formLang === “en” ? “#f0c97a” : “#5a4a30”) + ‘;cursor:pointer;font-family:Georgia,serif;font-weight:bold;font-size:13px”>EN</button>’;
html += ’<button onclick=“setFormLang('fr')” style=“padding:4px 12px;border-radius:20px;border:2px solid ’ + (state.formLang === “fr” ? “#1c1207” : “#c8baa0”) + ‘;background:’ + (state.formLang === “fr” ? “#1c1207” : “#fff”) + ‘;color:’ + (state.formLang === “fr” ? “#f0c97a” : “#5a4a30”) + ‘;cursor:pointer;font-family:Georgia,serif;font-weight:bold;font-size:13px”>FR</button>’;
html += ‘</div></div>’;
html += ‘<div style="display:grid;gap:16px">’;
html += ‘<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">’;
html += field(“Recipe name (EN)”, “name”, f.name);
html += field(“Nom de la recette (FR)”, “nameFr”, f.nameFr);
html += ‘</div>’;
html += ‘<div><label style="display:block;font-size:13px;color:#9a8a6a;margin-bottom:5px;font-family:Georgia,serif">’ + lang.category + ‘</label>’;
html += ‘<select onchange="setCategory(this.value)" style="width:100%;padding:10px 14px;border-radius:10px;border:2px solid #e0d5c0;background:#faf7f2;font-family:Georgia,serif;font-size:15px;outline:none;box-sizing:border-box">’;
html += ‘<option value="">–</option>’;
allEn().forEach(function(c, i) { html += ‘<option value=”’ + c + ‘”’ + (f.category === c ? “ selected” : “”) + ‘>’ + c + ’ / ’ + allFr()[i] + ‘</option>’; });
html += ‘</select></div>’;
html += ‘<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">’;
html += fieldNum(lang.prepTime + “ (min)”, “prepTime”, f.prepTime);
html += fieldNum(lang.cookTime + “ (min)”, “cookTime”, f.cookTime);
html += fieldNum(lang.servings, “servings”, f.servings);
html += ‘</div>’;
if (state.formLang === “en”) {
html += textarea(“Ingredients (EN)”, “ingredients”, f.ingredients, 5);
html += textarea(“Instructions (EN)”, “instructions”, f.instructions, 6);
html += textarea(“Notes (EN)”, “notes”, f.notes, 3);
} else {
html += textarea(“Ingredients (FR)”, “ingredientsFr”, f.ingredientsFr, 5);
html += textarea(“Instructions (FR)”, “instructionsFr”, f.instructionsFr, 6);
html += textarea(“Notes (FR)”, “notesFr”, f.notesFr, 3);
}
html += ‘<div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">’;
html += ‘<button onclick="goBack()" style="background:#f0ebe0;color:#5a4a30;border:none;border-radius:10px;padding:10px 24px;cursor:pointer;font-family:Georgia,serif;font-size:15px">’ + lang.cancel + ‘</button>’;
html += ‘<button onclick=“saveForm()” style=“background:’ + (state.saving ? “#aaa” : “#c0392b”) + ‘;color:#fff;border:none;border-radius:10px;padding:10px 28px;cursor:pointer;font-family:Georgia,serif;font-size:15px;font-weight:bold”>’ + (state.saving ? “⏳ “ + lang.saving : “💾 “ + lang.save) + ‘</button>’;
html += ‘</div></div></div>’;
}

html += ‘</div></div>’;

if (state.deleteConfirm) {
html += ‘<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:200">’;
html += ‘<div style="background:#fff;border-radius:16px;padding:28px 32px;max-width:360px;width:90%;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.2)">’;
html += ‘<div style="font-size:40px;margin-bottom:12px">🗑️</div>’;
html += ‘<p style="font-size:16px;margin-bottom:24px">’ + lang.confirmDelete + ‘</p>’;
html += ‘<div style="display:flex;gap:12px;justify-content:center">’;
html += ‘<button onclick="setState({deleteConfirm:null})" style="background:#f0ebe0;color:#5a4a30;border:none;border-radius:10px;padding:10px 24px;cursor:pointer;font-family:Georgia,serif">’ + lang.cancel + ‘</button>’;
html += ‘<button onclick="doDelete()" style="background:#c0392b;color:#fff;border:none;border-radius:10px;padding:10px 24px;cursor:pointer;font-family:Georgia,serif;font-weight:bold">’ + lang.del + ‘</button>’;
html += ‘</div></div></div>’;
}

app.innerHTML = html;
}

function field(label, key, val) {
return ‘<div><label style="display:block;font-size:13px;color:#9a8a6a;margin-bottom:5px;font-family:Georgia,serif">’ + label + ‘</label><input type=“text” value=”’ + (val || “”) + ‘” oninput=“setField('’ + key + ‘',this.value)” style=“width:100%;padding:10px 14px;border-radius:10px;border:2px solid #e0d5c0;background:#faf7f2;font-family:Georgia,serif;font-size:15px;outline:none;box-sizing:border-box”></div>’;
}
function fieldNum(label, key, val) {
return ‘<div><label style="display:block;font-size:13px;color:#9a8a6a;margin-bottom:5px;font-family:Georgia,serif">’ + label + ‘</label><input type=“number” value=”’ + (val || “”) + ‘” oninput=“setField('’ + key + ‘',this.value)” style=“width:100%;padding:10px 14px;border-radius:10px;border:2px solid #e0d5c0;background:#faf7f2;font-family:Georgia,serif;font-size:15px;outline:none;box-sizing:border-box”></div>’;
}
function textarea(label, key, val, rows) {
return ‘<div><label style="display:block;font-size:13px;color:#9a8a6a;margin-bottom:5px;font-family:Georgia,serif">’ + label + ‘</label><textarea rows="' + rows + '" oninput="setField(\'' + key + '\',this.value)" style="width:100%;padding:10px 14px;border-radius:10px;border:2px solid #e0d5c0;background:#faf7f2;font-family:Georgia,serif;font-size:15px;outline:none;box-sizing:border-box;resize:vertical;line-height:1.6">’ + (val || “”) + ‘</textarea></div>’;
}

function setLang(l) { setState({ lang: l }); }
function setSearch(v) { setState({ search: v }); }
function setCat(c) { setState({ activeCategory: c }); }
function setFormLang(l) { setState({ formLang: l }); }
function setField(key, val) { var f = Object.assign({}, state.form); f[key] = val; state.form = f; }
function setCategory(val) {
var idx = allEn().indexOf(val);
var f = Object.assign({}, state.form);
f.category = val;
f.categoryFr = idx >= 0 ? allFr()[idx] : val;
state.form = f;
}
function goBack() { setState({ view: “grid”, selected: null }); }
function openAdd() { setState({ form: emptyForm(), editMode: false, formLang: “en”, view: “form” }); }
function openDetail(id) {
var r = state.recipes.find(function(x) { return x.id === id; });
if (r) setState({ selected: r, view: “detail” });
}
function openEdit(id) {
var r = state.recipes.find(function(x) { return x.id === id; });
if (r) setState({ form: Object.assign({}, r), editMode: true, formLang: “en”, view: “form” });
}
function confirmDelete(id) { setState({ deleteConfirm: id }); }
function doDelete() {
var id = state.deleteConfirm;
db.remove(id).then(function() {
setState({ recipes: state.recipes.filter(function(r) { return r.id !== id; }), deleteConfirm: null, view: “grid” });
});
}
function saveForm() {
if (!state.form.name.trim()) return;
setState({ saving: true });
if (state.editMode) {
db.update(state.form.id, toDb(state.form)).then(function(updated) {
var mapped = fromDb(updated);
setState({ recipes: state.recipes.map(function(r) { return r.id === mapped.id ? mapped : r; }), selected: mapped, saving: false, view: “detail” });
});
} else {
db.insert(toDb(state.form)).then(function(created) {
var mapped = fromDb(created);
setState({ recipes: [mapped].concat(state.recipes), saving: false, view: “grid” });
});
}
}

document.addEventListener(“DOMContentLoaded”, function() {
db.getAll().then(function(data) {
setState({ recipes: (data || []).map(fromDb), loading: false });
}).catch(function() {
setState({ loading: false });
});
});
