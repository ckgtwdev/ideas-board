var TAGS = [
  ["indoor", "🌧 Indoor", "#bfd8e8"],
  ["outdoor", "☀️ Dry day outdoors", "#f6dc8c"],
  ["pets", "🐾 Pets away", "#f2b8b0"],
  ["laptop", "🖥 Laptop", "#cdbfe6"],
  ["quick", "⏱ Under 30 min", "#bfe0c4"],
  ["medium", "⏳ Under 120 min", "#b8d9d4"],
  ["long", "🕒 Long session", "#e9c9a6"],
];

var SEED = [
  {
    id: 1,
    icon: "🏺",
    title: "Weatherproof paper clay leaf tiles",
    tags: ["outdoor", "pets", "long"],
    goal: "Mix one batch and press 6 leaf tiles.",
    kit: "Dust mask\nBucket and old spoon\nPaper clay mix ingredients\nBin bags\nOld towel for the work surface",
    setup: "Dry day, back patio, pets indoors.",
    clean: "Wipe tools into a bin bag. Let leftover sludge dry, then bin it. Never rinse into drains.",
    first: "Put the kit box by the back door and check Friday’s forecast.",
    now: false,
  },
  {
    id: 2,
    icon: "🪡",
    title: "Small needlework sampler",
    tags: ["indoor", "quick"],
    goal: "Stitch one 10 cm motif from a saved pin.",
    kit: "Hoop\nThread\nNeedle\nFabric scrap",
    setup: "Sofa, evening, anywhere.",
    clean: "None. Put the hoop back in the basket.",
    first: "Thread the needle and make five stitches.",
    now: true,
  },
  {
    id: 3,
    icon: "🎨",
    title: "Pinterest-inspired watercolour leaf study",
    tags: ["indoor", "quick"],
    goal: "Paint three leaves in one palette.",
    kit: "Watercolour set\nPaper\nWater jar\nTissue",
    setup: "Kitchen table.",
    clean: "Rinse brushes in a jar, tip it on the garden or in a bin.",
    first: "Pick the saved pin and tape the paper down.",
    now: false,
  },
  {
    id: 4,
    icon: "💻",
    title: "Dataset mini-app",
    tags: ["laptop", "long"],
    goal: "Turn one public dataset into one useful chart.",
    kit: "Laptop\nDataset link\nA question to answer",
    setup: "Desk, quiet hour.",
    clean: "Commit and note where you stopped.",
    first: "Download the dataset and open it.",
    now: false,
  },
];

var S;
var OPEN = {};
var SEL = {};
var EDIT = null;
var FT = {};

function load() {
  try {
    var saved = localStorage.getItem("startboard");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return SEED;
}

function save() {
  try {
    localStorage.setItem("startboard", JSON.stringify(S));
  } catch (e) {}
}

function exportBoard() {
  var backup = {
    format: "startboard",
    version: 1,
    ideas: S,
  };
  var blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = "startboard-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

S = load();

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

function tg(k) {
  return TAGS.filter(function (tag) {
    return tag[0] === k;
  })[0];
}

function validBackup(backup) {
  if (
    !backup ||
    backup.format !== "startboard" ||
    backup.version !== 1 ||
    !Array.isArray(backup.ideas)
  ) {
    return false;
  }

  var ids = Object.create(null);
  var nowCount = 0;
  var textFields = ["icon", "goal", "kit", "setup", "clean", "first"];

  return backup.ideas.every(function (idea) {
    if (
      !idea ||
      typeof idea !== "object" ||
      !Number.isSafeInteger(idea.id) ||
      idea.id <= 0 ||
      ids[idea.id] ||
      typeof idea.title !== "string" ||
      !idea.title.trim() ||
      !Array.isArray(idea.tags) ||
      !idea.tags.every(function (key, index) {
        return typeof key === "string" && !!tg(key) && idea.tags.indexOf(key) === index;
      }) ||
      (Object.prototype.hasOwnProperty.call(idea, "now") && typeof idea.now !== "boolean") ||
      (Object.prototype.hasOwnProperty.call(idea, "archived") && typeof idea.archived !== "boolean") ||
      (idea.now && idea.archived) ||
      !textFields.every(function (key) {
        return !Object.prototype.hasOwnProperty.call(idea, key) || typeof idea[key] === "string";
      })
    ) {
      return false;
    }

    ids[idea.id] = true;
    if (idea.now && !idea.archived) nowCount++;
    return nowCount <= 3;
  });
}

function toast(message) {
  var status = document.getElementById("toast");
  status.textContent = message;
  status.className = "toast s";
  setTimeout(function () {
    status.className = "toast";
  }, 2200);
}

function card(idea) {
  var isOpen = OPEN[idea.id];
  var tags = idea.tags.map(tg).filter(Boolean);
  var safeId = esc(idea.id);
  var detailsId = "idea-details-" + safeId;
  var html =
    '<article class="card"><div class="stripe">' +
    tags
      .map(function (tag) {
        return '<i style="background:' + tag[2] + '"></i>';
      })
      .join("") +
    "</div>";

  html +=
    '<button class="head" type="button" data-a="tog" data-id="' +
    safeId +
    '" aria-expanded="' +
    !!isOpen +
    '" aria-controls="' +
    detailsId +
    '"><span class="ic">' +
    esc(idea.icon || "✨") +
    '</span><span><span class="ti">' +
    esc(idea.title) +
    '</span><span class="tg">' +
    tags
      .map(function (tag) {
        return '<span class="t" style="background:' + tag[2] + '">' + tag[1] + "</span>";
      })
      .join("") +
    "</span></span></button>";
  html += '<div class="body" id="' + detailsId + '"' + (isOpen ? "" : " hidden") + ">";

  if (isOpen) {
    if (idea.goal) html += "<h3>Goal</h3><p>" + esc(idea.goal) + "</p>";
    if (idea.kit) {
      html +=
        "<h3>Kit</h3><ul>" +
        idea.kit
          .split("\n")
          .filter(Boolean)
          .map(function (item) {
            return "<li>" + esc(item) + "</li>";
          })
          .join("") +
        "</ul>";
    }
    if (idea.setup) html += "<h3>Setup</h3><p>" + esc(idea.setup) + "</p>";
    if (idea.clean) html += "<h3>Cleanup</h3><p>" + esc(idea.clean) + "</p>";
    if (idea.first) html += '<h3>First tiny step</h3><p class="first">' + esc(idea.first) + "</p>";
    html += '<div class="acts">';
    if (idea.archived) {
      html += '<button class="p" data-a="unarc" data-id="' + safeId + '">Restore</button>';
    } else {
      html +=
        '<button class="p" data-a="mv" data-id="' +
        safeId +
        '">' +
        (idea.now ? "Park in Someday" : "Move to Now") +
        '</button><button data-a="arc" data-id="' +
        safeId +
        '">Archive</button>';
    }
    html +=
      '<button data-a="ed" data-id="' +
      safeId +
      '">Edit</button><button data-a="del" data-id="' +
      safeId +
      '">Delete</button></div>';
  }

  return html + "</div></article>";
}

function render() {
  var active = S.filter(function (idea) {
    return !idea.archived;
  });
  var now = active.filter(function (idea) {
    return idea.now;
  });
  var html = "";

  now.forEach(function (idea) {
    html += card(idea);
  });
  for (var i = now.length; i < 3; i++) {
    html += '<div class="slot">Free slot. Open an idea below and tap “Move to Now”.</div>';
  }
  document.getElementById("now").innerHTML = html;
  document.getElementById("chips").innerHTML = TAGS.map(function (tag) {
    return (
      '<button class="chip' +
      (SEL[tag[0]] ? " on" : "") +
      '" style="background:' +
      tag[2] +
      '" data-a="chip" data-id="' +
      tag[0] +
      '">' +
      tag[1] +
      "</button>"
    );
  }).join("");

  var selectedTags = Object.keys(SEL).filter(function (key) {
    return SEL[key];
  });
  var someday = active.filter(function (idea) {
    return (
      !idea.now &&
      selectedTags.every(function (key) {
        return idea.tags.indexOf(key) > -1;
      })
    );
  });
  document.getElementById("some").innerHTML = someday.length
    ? someday.map(card).join("")
    : '<div class="empty">Nothing matches those conditions. Clear a chip, or add a new idea.</div>';

  var archived = S.filter(function (idea) {
    return idea.archived;
  });
  document.getElementById("archived").innerHTML = archived.length
    ? archived.map(card).join("")
    : '<div class="empty">No archived ideas.</div>';
}

function openForm(idea) {
  EDIT = idea ? idea.id : null;
  idea = idea || { tags: [] };
  FT = {};
  idea.tags.forEach(function (key) {
    FT[key] = 1;
  });
  document.getElementById("dt").textContent = idea.id ? "Edit idea" : "New idea";

  var fields = {
    f_ic: idea.icon,
    f_ti: idea.title,
    f_goal: idea.goal,
    f_kit: idea.kit,
    f_setup: idea.setup,
    f_clean: idea.clean,
    f_first: idea.first,
  };
  for (var id in fields) {
    document.getElementById(id).value = fields[id] || "";
  }
  drawFT();
  document.getElementById("dlg").showModal();
}

function drawFT() {
  document.getElementById("f_tags").innerHTML = TAGS.map(function (tag) {
    return (
      '<button type="button" class="chip' +
      (FT[tag[0]] ? " on" : "") +
      '" style="background:' +
      tag[2] +
      '" data-a="ft" data-id="' +
      tag[0] +
      '">' +
      tag[1] +
      "</button>"
    );
  }).join("");
}

function val(id) {
  return document.getElementById(id).value.trim();
}

document.addEventListener("click", function (event) {
  var button = event.target.closest("[data-a]");
  if (!button) return;

  var action = button.dataset.a;
  var id = button.dataset.id;
  if (action === "export") {
    exportBoard();
    return;
  } else if (action === "import") {
    document.getElementById("import-file").click();
    return;
  }
  var idea = S.filter(function (item) {
    return String(item.id) === id;
  })[0];

  if (action === "tog") {
    OPEN[id] = !OPEN[id];
    render();
  } else if (action === "chip") {
    SEL[id] = !SEL[id];
    render();
  } else if (action === "ft") {
    FT[id] = FT[id] ? 0 : 1;
    drawFT();
  } else if (action === "mv") {
    if (!idea.now && S.filter(function (item) { return !item.archived && item.now; }).length >= 3) {
      toast("Now is full. Park one first.");
      return;
    }
    idea.now = !idea.now;
    save();
    render();
    toast(idea.now ? "Moved to Now. Time to start!" : "Parked in Someday.");
  } else if (action === "arc") {
    idea.archived = true;
    idea.now = false;
    save();
    render();
    toast("Idea archived.");
  } else if (action === "unarc") {
    idea.archived = false;
    save();
    render();
    toast("Idea restored.");
  } else if (action === "ed") {
    openForm(idea);
  } else if (action === "del" && confirm("Delete this idea?")) {
    S = S.filter(function (item) {
      return item !== idea;
    });
    save();
    render();
  }
});

document.getElementById("add").onclick = function () {
  openForm(null);
};

document.getElementById("cancel").onclick = function () {
  document.getElementById("dlg").close();
};

document.getElementById("import-file").onchange = function (event) {
  var file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  file.text().then(function (text) {
    var backup;
    try {
      backup = JSON.parse(text);
    } catch (e) {
      toast("That file is not valid JSON.");
      return;
    }
    if (!validBackup(backup)) {
      toast("That file is not a Start Board backup.");
      return;
    }
    if (!confirm("Importing this backup replaces the ideas currently on this board. Continue?")) return;

    S = backup.ideas;
    save();
    render();
    toast("Backup imported.");
  }).catch(function () {
    toast("Could not read that file.");
  });
};

document.getElementById("idea-form").onsubmit = function (event) {
  event.preventDefault();
  if (!val("f_ti")) {
    toast("Give the idea a name first.");
    return;
  }

  var idea = {
    icon: val("f_ic") || "✨",
    title: val("f_ti"),
    tags: Object.keys(FT).filter(function (key) {
      return FT[key];
    }),
    goal: val("f_goal"),
    kit: document.getElementById("f_kit").value.trim(),
    setup: val("f_setup"),
    clean: val("f_clean"),
    first: val("f_first"),
  };

  if (EDIT) {
    S.forEach(function (item) {
      if (item.id === EDIT) {
        for (var key in idea) item[key] = idea[key];
      }
    });
  } else {
    idea.id = Date.now();
    idea.now = false;
    S.push(idea);
  }

  save();
  document.getElementById("dlg").close();
  render();
};

render();
