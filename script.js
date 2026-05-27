const PROJECTS = [
  {
    id: "air",
    range: [1, 8],
    title: "爱心航空 IP 与运营活动",
    summary: "这组内容主要展示我如何围绕活动主题做角色、氛围、权益和运营视觉包装。",
  },
  {
    id: "liaoning",
    range: [9, 11],
    title: "AI 赋能辽宁公共文化服务中心",
    summary: "我把 AI 辅助创作引入公共文化服务场景，用更快的方式探索视觉表达和界面呈现。",
  },
  {
    id: "gogoal-app",
    range: [12, 34],
    title: "GoGoal 金融 App 页面与动效",
    summary: "这是作品集中最完整的产品部分，包含金融 App 页面、运营模块、视觉体系和动效展示。",
  },
  {
    id: "miniapp",
    range: [35, 35],
    title: "小程序项目",
    summary: "这一页是小程序方向的界面尝试，重点放在轻量入口和移动端任务路径。",
  },
  {
    id: "research-web",
    range: [36, 36],
    title: "基金研究平台 Web 端",
    summary: "这一页展示偏专业工具型的 Web 平台设计，我更关注信息密度、层级和可读性。",
  },
  {
    id: "gogoal-ip",
    range: [37, 37],
    title: "GoGoal IP 形象",
    summary: "这里是品牌 IP 的延展，尝试让金融产品有更强的角色记忆点。",
  },
  {
    id: "offline",
    range: [38, 38],
    title: "线下活动参与",
    summary: "这一页是线下活动相关内容，补充展示我对真实场景和活动落地的参与。",
  },
  {
    id: "illustration",
    range: [39, 43],
    title: "插画探索",
    summary: "这部分是插画与视觉风格探索，展示我在产品之外的图形表达能力。",
  },
  {
    id: "summary",
    range: [44, 44],
    title: "最终总结",
    summary: "最后一页是这份作品集的收束，也作为我这一阶段设计能力的总结。",
  },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
let activeSceneIndex = 0;
let tourTimer = null;
let activeProjectId = "";
let activeScenes = [];
let openLightboxByIndex = () => {};

document.documentElement.classList.add("js");

async function init() {
  const data = window.PORTFOLIO_DATA || (await loadPortfolioData());

  const curated = buildCuratedScenes(data.images);
  renderHero(data);
  renderStats(data);
  renderRail(curated);
  renderPageScrubber(curated);
  updateStage(curated[0], 0, curated);
  renderWall(data.images);
  bindLightbox(data.images);
  bindShuffle(data.images);
  bindObservers();
  bindGalleryControls(curated);
  bindStageProjectScroll(curated);
  bindStageImageOpen();
  bindWallFilters();
  bindStageScrollContain();
  bindScrollProgress();
  bindCursorGlow();
  bindTilt();
  bindMagnetic();
}

async function loadPortfolioData() {
  const response = await fetch("./portfolio-data.json");
  return response.json();
}

function buildCuratedScenes(images) {
  return images.map((image, index) => {
    const page = index + 1;
    const project = getProjectForPage(page);

    return {
      ...image,
      scene: page,
      project,
      name: project.title,
      copy: buildPageCopy(page, project, image),
    };
  });
}

function getProjectForPage(page) {
  return PROJECTS.find((project) => page >= project.range[0] && page <= project.range[1]) || PROJECTS[0];
}

function buildPageCopy(page, project, image) {
  const detail = image.type === "gif" ? "这一页包含动效内容，可以重点看节奏和状态变化。" : "这一页可以在主图区域内滚动查看完整细节。";
  return `P${String(page).padStart(2, "0")} 属于「${project.title}」。${project.summary}${detail}`;
}

function getProjectStartIndex(project) {
  return project.range[0] - 1;
}

function getProjectLabel(project) {
  return project.range[0] === project.range[1]
    ? `P${String(project.range[0]).padStart(2, "0")}`
    : `P${String(project.range[0]).padStart(2, "0")}-P${String(project.range[1]).padStart(2, "0")}`;
}

function getImageKind(image) {
  if (image.type === "gif") {
    return "动效";
  }

  return image.height / image.width > 2 ? "长图" : "静帧";
}

function getScenesInProject(scenes, project) {
  return scenes.filter((scene) => scene.scene >= project.range[0] && scene.scene <= project.range[1]);
}

function getProjectCounts(scenes, project) {
  const projectScenes = getScenesInProject(scenes, project);
  const motionCount = projectScenes.filter((scene) => scene.type === "gif").length;

  return {
    pages: projectScenes.length,
    motionCount,
  };
}

function renderPageScrubber(curated) {
  const scrubber = $("#pageScrubber");
  scrubber.innerHTML = "";

  curated.forEach((item, index) => {
    const button = document.createElement("button");
    button.className = "page-dot";
    button.type = "button";
    button.dataset.index = String(index);
    button.dataset.project = item.project.id;
    button.textContent = `P${String(item.scene).padStart(2, "0")}`;
    button.setAttribute("aria-label", `查看第 ${item.scene} 页，${item.project.title}`);
    scrubber.appendChild(button);
  });
}

function renderHero(data) {
  const cover = data.cover || data.images[0]?.url;
  document.documentElement.style.setProperty("--kv-image", `url("${cover}")`);
  $("#heroCover").src = cover;
  $("#heroMeta").textContent = `${data.author} · ${data.category} / ${data.subcategory}`;
  $("#heroCount").textContent = `${data.images.length} 张作品画面`;
}

function renderStats(data) {
  const stats = [
    ["作者", data.author],
    ["项目章节", `${PROJECTS.length} 个`],
    ["覆盖方向", "IP / App / Web / 插画"],
    ["重点项目", "GoGoal 金融 App"],
    ["画面数量", `${data.images.length} 张`],
  ];

  const host = $("#story").previousElementSibling?.id === "hero" ? $("#story") : $(".stats-ribbon");
  host.innerHTML = "";
  const template = $("#statTemplate");

  stats.forEach(([label, value]) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".stat-label").textContent = label;
    node.querySelector(".stat-value").textContent = value;
    host.appendChild(node);
  });
}

function renderRail(curated) {
  const rail = $("#galleryRail");
  const template = $("#railTemplate");
  rail.innerHTML = "";

  PROJECTS.forEach((project) => {
    const counts = getProjectCounts(curated, project);
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(getProjectStartIndex(project));
    node.dataset.project = project.id;
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.querySelector(".rail-step").textContent = `${getProjectLabel(project)} · ${counts.pages} 页${counts.motionCount ? ` · ${counts.motionCount} 个动效` : ""}`;
    node.querySelector(".rail-name").textContent = project.title;
    node.querySelector(".rail-copy").textContent = project.summary;
    rail.appendChild(node);
  });

  updateStage(curated[0], 0, curated);
}

function updateStage(item, index, curated = null) {
  activeSceneIndex = index;
  const scenes = curated || activeScenes;

  if (item.project.id !== activeProjectId) {
    activeProjectId = item.project.id;
    renderStageProject(scenes, item.project);
  }

  scrollStageToPage(index);
  updateStageMeta(item, index);
}

function renderStageProject(scenes, project) {
  const stack = $("#stageStack");
  const projectScenes = getScenesInProject(scenes, project);
  activeScenes = scenes;
  stack.innerHTML = "";

  projectScenes.forEach((scene) => {
    const figure = document.createElement("figure");
    figure.className = "stage-page";
    figure.dataset.index = String(scene.scene - 1);
    figure.dataset.project = scene.project.id;

    const button = document.createElement("button");
    button.className = "stage-image-button";
    button.type = "button";
    button.dataset.index = String(scene.scene - 1);
    button.setAttribute("aria-label", `查看 P${String(scene.scene).padStart(2, "0")} 大图`);

    const image = document.createElement("img");
    image.src = scene.url;
    image.alt = `P${String(scene.scene).padStart(2, "0")} ${scene.project.title}`;
    image.loading = scene.scene <= project.range[0] + 1 ? "eager" : "lazy";

    const caption = document.createElement("figcaption");
    caption.textContent = `P${String(scene.scene).padStart(2, "0")} · ${getImageKind(scene)}`;

    button.appendChild(image);
    figure.append(button, caption);
    stack.appendChild(figure);
  });
}

function scrollStageToPage(index) {
  const viewport = $("#stageViewport");
  const page = document.querySelector(`.stage-page[data-index="${index}"]`);

  if (!page) {
    return;
  }

  viewport.scrollTo({
    top: page.offsetTop,
    behavior: "smooth",
  });
}

function updateStageMeta(item, index) {
  activeSceneIndex = index;
  $("#stageIndex").textContent = `P${String(item.scene).padStart(2, "0")} · ${getImageKind(item)}`;
  $("#stageTitle").textContent = item.name;
  $("#stageDesc").textContent = item.copy;

  $$(".rail-card").forEach((card) => {
    card.classList.toggle("is-active", card.dataset.project === item.project.id);
  });

  $$(".page-dot").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });
}

function bindStageProjectScroll(curated) {
  const viewport = $("#stageViewport");
  let frame = 0;

  viewport.addEventListener(
    "scroll",
    () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const pages = $$(".stage-page");
        const current = pages.reduce((active, page) => {
          return page.offsetTop <= viewport.scrollTop + 24 ? page : active;
        }, pages[0]);

        if (!current) {
          return;
        }

        const index = Number(current.dataset.index);
        if (Number.isNaN(index) || index === activeSceneIndex) {
          return;
        }

        updateStageMeta(curated[index], index);
        document.querySelector(`.page-dot[data-index="${index}"]`)?.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      });
    },
    { passive: true },
  );
}

function bindStageImageOpen() {
  $("#stageStack").addEventListener("click", (event) => {
    const button = event.target.closest(".stage-image-button");
    if (!button) {
      return;
    }

    openLightboxByIndex(Number(button.dataset.index));
  });
}

function renderWall(images) {
  const wall = $("#masonry");
  const template = $("#wallTemplate");
  wall.innerHTML = "";

  images.forEach((image, index) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.index = String(index);
    node.dataset.kind = image.type === "gif" ? "motion" : "still";
    node.dataset.long = image.height / image.width > 2 ? "true" : "false";
    node.dataset.project = getProjectForPage(index + 1).id;
    node.querySelector("img").src = image.thumb || image.url;
    node.querySelector("img").alt = `作品画面 ${index + 1}`;
    node.querySelector(".masonry-meta").textContent = `P${String(index + 1).padStart(2, "0")} · ${getProjectForPage(index + 1).title}`;
    wall.appendChild(node);
  });
}

function bindGalleryControls(curated) {
  const tourButton = $("#tourButton");

  const goToScene = (index, shouldScroll = false) => {
    const nextIndex = (index + curated.length) % curated.length;
    updateStage(curated[nextIndex], nextIndex);

    if (shouldScroll) {
      document.querySelector(`.page-dot[data-index="${nextIndex}"]`)?.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };

  const stopTour = () => {
    window.clearInterval(tourTimer);
    tourTimer = null;
    tourButton.textContent = "播放逐页导览";
    tourButton.classList.remove("is-playing");
  };

  $("#prevScene").addEventListener("click", () => {
    stopTour();
    goToScene(activeSceneIndex - 1, true);
  });

  $("#nextScene").addEventListener("click", () => {
    stopTour();
    goToScene(activeSceneIndex + 1, true);
  });

  tourButton.addEventListener("click", () => {
    if (tourTimer) {
      stopTour();
      return;
    }

    tourButton.textContent = "暂停导览";
    tourButton.classList.add("is-playing");
    $("#gallery").scrollIntoView({ behavior: "smooth", block: "start" });
    tourTimer = window.setInterval(() => {
      goToScene(activeSceneIndex + 1, true);
    }, 5200);
  });

  $("#pageScrubber").addEventListener("click", (event) => {
    const button = event.target.closest(".page-dot");
    if (!button) {
      return;
    }

    stopTour();
    goToScene(Number(button.dataset.index), true);
  });

  $("#galleryRail").addEventListener("click", (event) => {
    const card = event.target.closest(".rail-card");
    if (!card) {
      return;
    }
    stopTour();
    goToScene(Number(card.dataset.index), true);
  });

  $("#galleryRail").addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const card = event.target.closest(".rail-card");
    if (!card) {
      return;
    }

    event.preventDefault();
    stopTour();
    goToScene(Number(card.dataset.index), true);
  });
}

function bindWallFilters() {
  const tabs = $$(".filter-tab");
  const items = $$(".masonry-item");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const filter = tab.dataset.filter;
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));

      items.forEach((item) => {
        const visible =
          filter === "all" ||
          (filter === "motion" && item.dataset.kind === "motion") ||
          (filter === "still" && item.dataset.kind === "still") ||
          (filter === "long" && item.dataset.long === "true");

        item.hidden = !visible;
      });
    });
  });
}

function bindScrollProgress() {
  const progress = $("#scrollProgress");
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = `scaleX(${Math.min(Math.max(value, 0), 1)})`;
  };

  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

function bindLightbox(images) {
  const lightbox = $("#lightbox");
  const image = $("#lightboxImage");
  const counter = $("#lightboxCounter");
  const title = $("#lightboxTitle");
  let current = 0;

  const open = (index) => {
    current = index;
    const item = images[current];
    const project = getProjectForPage(current + 1);
    image.src = item.url;
    counter.textContent = `${String(current + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
    title.textContent = `P${String(current + 1).padStart(2, "0")} · ${project.title}`;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  openLightboxByIndex = open;

  const close = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const step = (direction) => {
    current = (current + direction + images.length) % images.length;
    open(current);
  };

  $("#masonry").addEventListener("click", (event) => {
    const item = event.target.closest(".masonry-item");
    if (!item) {
      return;
    }
    open(Number(item.dataset.index));
  });

  $("#lightboxClose").addEventListener("click", close);
  $("#lightboxPrev").addEventListener("click", () => step(-1));
  $("#lightboxNext").addEventListener("click", () => step(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      close();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      close();
    }
    if (event.key === "ArrowLeft") {
      step(-1);
    }
    if (event.key === "ArrowRight") {
      step(1);
    }
  });
}

function bindShuffle(images) {
  const jump = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    const target = document.querySelector(`.masonry-item[data-index="${randomIndex}"]`);
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
    target?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.03)" },
        { transform: "scale(1)" },
      ],
      { duration: 480, easing: "ease-out" },
    );
  };

  $("#shuffleButton").addEventListener("click", jump);
  $("#surpriseButton").addEventListener("click", jump);
}

function bindObservers() {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  $$(".reveal").forEach((node) => revealObserver.observe(node));
}

function bindStageScrollContain() {
  const viewport = $("#stageViewport");

  viewport.addEventListener(
    "wheel",
    (event) => {
      const canScroll = viewport.scrollHeight > viewport.clientHeight;

      if (!canScroll) {
        return;
      }

      const atTop = viewport.scrollTop <= 0;
      const atBottom = Math.ceil(viewport.scrollTop + viewport.clientHeight) >= viewport.scrollHeight;
      const movingUp = event.deltaY < 0;
      const movingDown = event.deltaY > 0;

      if ((movingUp && !atTop) || (movingDown && !atBottom)) {
        event.stopPropagation();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    { passive: false },
  );
}

function bindCursorGlow() {
  const glow = $(".cursor-glow");
  window.addEventListener("pointermove", (event) => {
    glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  });
}

function bindTilt() {
  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 8;
      const rotateX = (0.5 - py) * 8;
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function bindMagnetic() {
  $$(".magnetic").forEach((node) => {
    node.addEventListener("pointermove", (event) => {
      const rect = node.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      node.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    node.addEventListener("pointerleave", () => {
      node.style.transform = "";
    });
  });
}

function revealEverything() {
  $$(".reveal").forEach((node) => node.classList.add("is-visible"));
}

init().catch((error) => {
  console.error(error);
  revealEverything();
});
