import { useState, useEffect } from “react”;

const SUPABASE_URL = “https://guloagtocokotjvwcchu.supabase.co”;
const SUPABASE_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bG9hZ3RvY29rb3RqdndjY2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzA1ODcsImV4cCI6MjA5MjE0NjU4N30.QXAKN5cig5Di-0XVoB-vk0WohjhrQdn9VjZlW_mJEqU”;

const db = {
async getAll() {
const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes?order=created_at.desc`, {
headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
});
return res.json();
},
async insert(recipe) {
const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes`, {
method: “POST”,
headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, “Content-Type”: “application/json”, Prefer: “return=representation” },
body: JSON.stringify(recipe)
});
const data = await res.json();
return data[0];
},
async update(id, recipe) {
const res = await fetch(`${SUPABASE_URL}/rest/v1/recipes?id=eq.${id}`, {
method: “PATCH”,
headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, “Content-Type”: “application/json”, Prefer: “return=representation” },
body: JSON.stringify(recipe)
});
const data = await res.json();
return data[0];
},
async delete(id) {
await fetch(`${SUPABASE_URL}/rest/v1/recipes?id=eq.${id}`, {
method: “DELETE”,
headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
});
}
};

const LANG = {
en: {
title: “My Recipe Book”, subtitle: “Your personal culinary collection”,
search: “Search recipes…”, all: “All”, add: “Add Recipe”, edit: “Edit”,
delete: “Delete”, save: “Save”, cancel: “Cancel”, recipeName: “Recipe name”,
category: “Category”, prepTime: “Prep time”, cookTime: “Cook time”,
servings: “Servings”, ingredients: “Ingredients”, instructions: “Instructions”,
notes: “Notes (optional)”, ingredientsPlaceholder: “One ingredient per line”,
instructionsPlaceholder: “Describe the steps…”, notesPlaceholder: “Tips, variations…”,
noRecipes: “No recipes yet.”, addFirst: “Add your first recipe!”,
noMatch: “No recipes match your search.”, confirmDelete: “Delete this recipe?”,
min: “min”, serves: “serves”, loading: “Loading your recipes…”, saving: “Saving…”,
categories: [“Italian”, “French”, “Asian”, “Desserts”, “Baking”],
},
fr: {
title: “Mon Livre de Recettes”, subtitle: “Votre collection culinaire personnelle”,
search: “Rechercher…”, all: “Tout”, add: “Ajouter une recette”, edit: “Modifier”,
delete: “Supprimer”, save: “Enregistrer”, cancel: “Annuler”, recipeName: “Nom de la recette”,
category: “Catégorie”, prepTime: “Temps de prép.”, cookTime: “Temps de cuisson”,
servings: “Portions”, ingredients: “Ingrédients”, instructions: “Instructions”,
notes: “Notes (facultatif)”, ingredientsPlaceholder: “Un ingrédient par ligne”,
instructionsPlaceholder: “Décrivez les étapes…”, notesPlaceholder: “Astuces, variantes…”,
noRecipes: “Aucune recette pour le moment.”, addFirst: “Ajoutez votre première recette !”,
noMatch: “Aucune recette ne correspond à votre recherche.”, confirmDelete: “Supprimer cette recette ?”,
min: “min”, serves: “portions”, loading: “Chargement…”, saving: “Enregistrement…”,
categories: [“Italienne”, “Française”, “Asiatique”, “Desserts”, “Pâtisserie”],
},
};

const CATEGORY_ICONS = { Italian: “🍝”, Italienne: “🍝”, French: “🥐”, Française: “🥐”, Asian: “🍜”, Asiatique: “🍜”, Desserts: “🍮”, Baking: “🍞”, Pâtisserie: “🍞” };
const CATEGORY_COLORS = { Italian: “#c0392b”, Italienne: “#c0392b”, French: “#2c3e8c”, Française: “#2c3e8c”, Asian: “#e67e22”, Asiatique: “#e67e22”, Desserts: “#8e44ad”, Baking: “#c0873f”, Pâtisserie: “#c0873f” };

const toDb = (f) => ({ name: f.name, name_fr: f.nameFr, category: f.category, category_fr: f.categoryFr, prep_time: f.prepTime ? parseInt(f.prepTime) : null, cook_time: f.cookTime ? parseInt(f.cookTime) : null, servings: f.servings ? parseInt(f.servings) : null, ingredients: f.ingredients, ingredients_fr: f.ingredientsFr, instructions: f.instructions, instructions_fr: f.instructionsFr, notes: f.notes, notes_fr: f.notesFr });
const fromDb = (r) => ({ id: r.id, name: r.name, nameFr: r.name_fr, category: r.category, categoryFr: r.category_fr, prepTime: r.prep_time, cookTime: r.cook_time, servings: r.servings, ingredients: r.ingredients, ingredientsFr: r.ingredients_fr, instructions: r.instructions, instructionsFr: r.instructions_fr, notes: r.notes, notesFr: r.notes_fr });
const emptyForm = () => ({ id: null, name: “”, nameFr: “”, category: “”, categoryFr: “”, prepTime: “”, cookTime: “”, servings: “”, ingredients: “”, ingredientsFr: “”, instructions: “”, instructionsFr: “”, notes: “”, notesFr: “” });

const labelStyle = { display: “block”, fontSize: 13, color: “#9a8a6a”, marginBottom: 5, fontFamily: “Georgia, serif” };
const inputStyle = { width: “100%”, padding: “10px 14px”, borderRadius: 10, border: “2px solid #e0d5c0”, background: “#faf7f2”, fontFamily: “Georgia, serif”, fontSize: 15, outline: “none”, boxSizing: “border-box” };

function Field({ label, value, onChange, type = “text” }) {
return <div><label style={labelStyle}>{label}</label><input type={type} value={value ?? “”} onChange={e => onChange(e.target.value)} style={inputStyle} /></div>;
}
function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
return <div><label style={labelStyle}>{label}</label><textarea value={value ?? “”} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ …inputStyle, resize: “vertical”, lineHeight: 1.6 }} /></div>;
}

export default function RecipeBook() {
const [lang, setLang] = useState(“en”);
const [recipes, setRecipes] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [search, setSearch] = useState(””);
const [activeCategory, setActiveCategory] = useState(“all”);
const [view, setView] = useState(“grid”);
const [selectedRecipe, setSelectedRecipe] = useState(null);
const [form, setForm] = useState(emptyForm());
const [editMode, setEditMode] = useState(false);
const [deleteConfirm, setDeleteConfirm] = useState(null);
const [formLang, setFormLang] = useState(“en”);

const t = LANG[lang];

useEffect(() => {
db.getAll().then(data => {
setRecipes((data || []).map(fromDb));
setLoading(false);
}).catch(() => setLoading(false));
}, []);

const allCategories = LANG.en.categories;
const categories = t.categories;

const filtered = recipes.filter(r => {
const name = lang === “en” ? r.name : (r.nameFr || r.name);
const matchSearch = (name || “”).toLowerCase().includes(search.toLowerCase()) ||
(r.ingredients || “”).toLowerCase().includes(search.toLowerCase());
const matchCat = activeCategory === “all” || r.category === activeCategory;
return matchSearch && matchCat;
});

const openDetail = (r) => { setSelectedRecipe(r); setView(“detail”); };
const openAdd = () => { setForm(emptyForm()); setEditMode(false); setFormLang(“en”); setView(“form”); };
const openEdit = (r) => { setForm({ …r }); setEditMode(true); setFormLang(“en”); setView(“form”); };
const goBack = () => { setView(“grid”); setSelectedRecipe(null); };

const saveForm = async () => {
if (!form.name.trim()) return;
setSaving(true);
try {
if (editMode) {
const updated = await db.update(form.id, toDb(form));
const mapped = fromDb(updated);
setRecipes(recipes.map(r => r.id === form.id ? mapped : r));
setSelectedRecipe(mapped);
setView(“detail”);
} else {
const created = await db.insert(toDb(form));
const mapped = fromDb(created);
setRecipes([mapped, …recipes]);
setView(“grid”);
}
} finally { setSaving(false); }
};

const deleteRecipe = async (id) => {
await db.delete(id);
setRecipes(recipes.filter(r => r.id !== id));
setDeleteConfirm(null);
setView(“grid”);
};

const catColor = (cat) => CATEGORY_COLORS[cat] || “#555”;
const catIcon = (cat) => CATEGORY_ICONS[cat] || “🍽️”;
const displayName = (r) => lang === “en” ? r.name : (r.nameFr || r.name);
const displayCat = (r) => lang === “en” ? r.category : (r.categoryFr || r.category);
const displayIngredients = (r) => lang === “en” ? r.ingredients : (r.ingredientsFr || r.ingredients);
const displayInstructions = (r) => lang === “en” ? r.instructions : (r.instructionsFr || r.instructions);
const displayNotes = (r) => lang === “en” ? r.notes : (r.notesFr || r.notes);

return (
<div style={{ minHeight: “100vh”, background: “#faf7f2”, fontFamily: “‘Georgia’, serif”, color: “#2a2018” }}>
<header style={{ background: “#1c1207”, position: “sticky”, top: 0, zIndex: 100, boxShadow: “0 2px 20px rgba(0,0,0,0.3)” }}>
<div style={{ maxWidth: 900, margin: “0 auto”, padding: “0 20px”, display: “flex”, alignItems: “center”, justifyContent: “space-between”, height: 64 }}>
<div style={{ display: “flex”, alignItems: “center”, gap: 12 }}>
{(view === “detail” || view === “form”) && (
<button onClick={goBack} style={{ background: “none”, border: “none”, color: “#f0c97a”, cursor: “pointer”, fontSize: 20, padding: “0 8px 0 0” }}>←</button>
)}
<span style={{ fontSize: 22, fontWeight: “bold”, color: “#f0c97a”, letterSpacing: 1 }}>📖 {t.title}</span>
</div>
<div style={{ display: “flex”, gap: 8 }}>
{[“en”, “fr”].map(l => (
<button key={l} onClick={() => setLang(l)} style={{ padding: “4px 12px”, borderRadius: 20, border: “none”, cursor: “pointer”, background: lang === l ? “#f0c97a” : “transparent”, color: lang === l ? “#1c1207” : “#f0c97a”, fontWeight: “bold”, fontSize: 13 }}>{l.toUpperCase()}</button>
))}
</div>
</div>
</header>

```
  <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

    {loading && (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "#9a8a6a" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <p style={{ fontSize: 18 }}>{t.loading}</p>
      </div>
    )}

    {!loading && view === "grid" && (
      <>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
            style={{ flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 10, border: "2px solid #e0d5c0", background: "#fff", fontSize: 15, fontFamily: "Georgia, serif", outline: "none" }} />
          <button onClick={openAdd} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: "bold", fontSize: 15, cursor: "pointer", fontFamily: "Georgia, serif", whiteSpace: "nowrap" }}>+ {t.add}</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <button onClick={() => setActiveCategory("all")} style={{ padding: "6px 16px", borderRadius: 20, border: "2px solid", borderColor: activeCategory === "all" ? "#1c1207" : "#c8baa0", background: activeCategory === "all" ? "#1c1207" : "#fff", color: activeCategory === "all" ? "#f0c97a" : "#5a4a30", cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 13 }}>{t.all}</button>
          {allCategories.map((cat, i) => (
            <button key={cat} onClick={() => setActiveCategory(activeCategory === cat ? "all" : cat)} style={{ padding: "6px 16px", borderRadius: 20, border: "2px solid", borderColor: activeCategory === cat ? catColor(cat) : "#c8baa0", background: activeCategory === cat ? catColor(cat) : "#fff", color: activeCategory === cat ? "#fff" : "#5a4a30", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 13 }}>
              {catIcon(cat)} {categories[i]}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9a8a6a" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
            <p style={{ fontSize: 18 }}>{search ? t.noMatch : t.noRecipes}</p>
            {!search && <button onClick={openAdd} style={{ marginTop: 12, background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 15 }}>+ {t.addFirst}</button>}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {filtered.map(recipe => (
              <div key={recipe.id} onClick={() => openDetail(recipe)} style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", cursor: "pointer", border: "1px solid #ece5d8", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.14)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}>
                <div style={{ background: catColor(recipe.category), padding: "20px 20px 14px", position: "relative" }}>
                  <div style={{ fontSize: 36 }}>{catIcon(recipe.category)}</div>
                  <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#fff", fontWeight: "bold" }}>{displayCat(recipe)}</div>
                </div>
                <div style={{ padding: "16px 18px 18px" }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 17, lineHeight: 1.3, color: "#1c1207" }}>{displayName(recipe)}</h3>
                  <div style={{ display: "flex", gap: 14, color: "#9a8a6a", fontSize: 13 }}>
                    {recipe.prepTime && <span>⏱ {recipe.prepTime}{t.min}</span>}
                    {recipe.servings && <span>👥 {recipe.servings} {t.serves}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    )}

    {!loading && view === "detail" && selectedRecipe && (() => {
      const r = selectedRecipe;
      return (
        <div style={{ background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", border: "1px solid #ece5d8" }}>
          <div style={{ background: catColor(r.category), padding: "32px 32px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 48, marginBottom: 8 }}>{catIcon(r.category)}</div>
              <h2 style={{ margin: 0, color: "#fff", fontSize: 26, lineHeight: 1.2 }}>{displayName(r)}</h2>
              {lang === "en" && r.nameFr && <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 15, fontStyle: "italic" }}>{r.nameFr}</p>}
              <span style={{ display: "inline-block", marginTop: 10, background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "3px 14px", color: "#fff", fontSize: 13 }}>{displayCat(r)}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEdit(r)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14 }}>✏️ {t.edit}</button>
              <button onClick={() => setDeleteConfirm(r.id)} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 14 }}>🗑️</button>
            </div>
          </div>
          <div style={{ padding: "24px 32px" }}>
            <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
              {r.prepTime && <div style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>⏱️</div><div style={{ fontSize: 13, color: "#9a8a6a" }}>{t.prepTime}</div><div style={{ fontWeight: "bold", fontSize: 16 }}>{r.prepTime} {t.min}</div></div>}
              {r.cookTime && <div style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>🔥</div><div style={{ fontSize: 13, color: "#9a8a6a" }}>{t.cookTime}</div><div style={{ fontWeight: "bold", fontSize: 16 }}>{r.cookTime} {t.min}</div></div>}
              {r.servings && <div style={{ textAlign: "center" }}><div style={{ fontSize: 22 }}>👥</div><div style={{ fontSize: 13, color: "#9a8a6a" }}>{t.servings}</div><div style={{ fontWeight: "bold", fontSize: 16 }}>{r.servings}</div></div>}
            </div>
            {displayIngredients(r) && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ color: catColor(r.category), fontSize: 16, marginBottom: 12, borderBottom: `2px solid ${catColor(r.category)}`, paddingBottom: 6 }}>🛒 {t.ingredients}</h4>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {displayIngredients(r).split("\n").filter(Boolean).map((ing, i) => <li key={i} style={{ marginBottom: 6, fontSize: 15, lineHeight: 1.5 }}>{ing}</li>)}
                </ul>
              </div>
            )}
            {displayInstructions(r) && (
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ color: catColor(r.category), fontSize: 16, marginBottom: 12, borderBottom: `2px solid ${catColor(r.category)}`, paddingBottom: 6 }}>📋 {t.instructions}</h4>
                <div style={{ lineHeight: 1.8, fontSize: 15, whiteSpace: "pre-line" }}>{displayInstructions(r)}</div>
              </div>
            )}
            {displayNotes(r) && (
              <div style={{ background: "#faf7f2", borderRadius: 10, padding: "14px 18px", borderLeft: `4px solid ${catColor(r.category)}` }}>
                <h4 style={{ margin: "0 0 6px", fontSize: 14, color: "#9a8a6a" }}>💡 {t.notes}</h4>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, fontStyle: "italic" }}>{displayNotes(r)}</p>
              </div>
            )}
          </div>
        </div>
      );
    })()}

    {!loading && view === "form" && (
      <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", border: "1px solid #ece5d8" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{editMode ? `✏️ ${t.edit}` : `+ ${t.add}`}</h2>
          <div style={{ display: "flex", gap: 8 }}>
            {["en", "fr"].map(l => (
              <button key={l} onClick={() => setFormLang(l)} style={{ padding: "4px 12px", borderRadius: 20, border: "2px solid", borderColor: formLang === l ? "#1c1207" : "#c8baa0", background: formLang === l ? "#1c1207" : "#fff", color: formLang === l ? "#f0c97a" : "#5a4a30", cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold", fontSize: 13 }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Recipe name (EN)" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Field label="Nom de la recette (FR)" value={form.nameFr} onChange={v => setForm({ ...form, nameFr: v })} />
          </div>
          <div>
            <label style={labelStyle}>{t.category}</label>
            <select value={form.category} onChange={e => {
              const idx = LANG.en.categories.indexOf(e.target.value);
              setForm({ ...form, category: e.target.value, categoryFr: LANG.fr.categories[idx] || e.target.value });
            }} style={inputStyle}>
              <option value="">--</option>
              {LANG.en.categories.map((c, i) => <option key={c} value={c}>{c} / {LANG.fr.categories[i]}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label={`${t.prepTime} (min)`} value={form.prepTime} onChange={v => setForm({ ...form, prepTime: v })} type="number" />
            <Field label={`${t.cookTime} (min)`} value={form.cookTime} onChange={v => setForm({ ...form, cookTime: v })} type="number" />
            <Field label={t.servings} value={form.servings} onChange={v => setForm({ ...form, servings: v })} type="number" />
          </div>
          {formLang === "en"
            ? <TextArea label="Ingredients (EN)" value={form.ingredients} onChange={v => setForm({ ...form, ingredients: v })} placeholder={t.ingredientsPlaceholder} rows={5} />
            : <TextArea label="Ingrédients (FR)" value={form.ingredientsFr} onChange={v => setForm({ ...form, ingredientsFr: v })} placeholder={LANG.fr.ingredientsPlaceholder} rows={5} />}
          {formLang === "en"
            ? <TextArea label="Instructions (EN)" value={form.instructions} onChange={v => setForm({ ...form, instructions: v })} placeholder={t.instructionsPlaceholder} rows={6} />
            : <TextArea label="Instructions (FR)" value={form.instructionsFr} onChange={v => setForm({ ...form, instructionsFr: v })} placeholder={LANG.fr.instructionsPlaceholder} rows={6} />}
          {formLang === "en"
            ? <TextArea label="Notes (EN)" value={form.notes} onChange={v => setForm({ ...form, notes: v })} placeholder={t.notesPlaceholder} rows={3} />
            : <TextArea label="Notes (FR)" value={form.notesFr} onChange={v => setForm({ ...form, notesFr: v })} placeholder={LANG.fr.notesPlaceholder} rows={3} />}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={goBack} style={{ background: "#f0ebe0", color: "#5a4a30", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontFamily: "Georgia, serif", fontSize: 15 }}>{t.cancel}</button>
            <button onClick={saveForm} disabled={saving} style={{ background: saving ? "#aaa" : "#c0392b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 28px", cursor: saving ? "default" : "pointer", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: "bold" }}>
              {saving ? `⏳ ${t.saving}` : `💾 ${t.save}`}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>

  {deleteConfirm && (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", maxWidth: 360, width: "90%", textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <p style={{ fontSize: 16, marginBottom: 24 }}>{t.confirmDelete}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => setDeleteConfirm(null)} style={{ background: "#f0ebe0", color: "#5a4a30", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontFamily: "Georgia, serif" }}>{t.cancel}</button>
          <button onClick={() => deleteRecipe(deleteConfirm)} style={{ background: "#c0392b", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontFamily: "Georgia, serif", fontWeight: "bold" }}>{t.delete}</button>
        </div>
      </div>
    </div>
  )}
</div>
```

);
}