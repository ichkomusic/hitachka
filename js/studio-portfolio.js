(function renderStudioPortfolio(){
  const {projects, gallery} = window.HITACHKA_CONTENT;
  const siteRoot = new URL("../", document.currentScript.src);

  function element(tag, className, text){
    const node = document.createElement(tag);
    if(className) node.className = className;
    if(text) node.textContent = text;
    return node;
  }

  function photo(item, alt){
    const image = element('img');
    image.src = new URL(item.image, siteRoot).href;
    image.alt = alt;
    image.loading = 'lazy';
    return image;
  }

  function projectCard(project){
    const card = element('article','project');
    const covers = {voice:'Глас',track:'Трак',ep:'EP'};
    const style = Object.hasOwn(covers, project.sample) ? project.sample : 'voice';
    const cover = element('div','project-cover cover-'+style);
    cover.setAttribute('aria-hidden','true');
    cover.append(project.image ? photo(project,'') :
      element('span','',covers[project.sample] || project.title.slice(0,2).toLocaleUpperCase('bg')));
    const meta = element('div','project-meta');
    meta.append(element('h2','',project.title));
    if(project.credits) meta.append(element('p','',project.credits));
    if(project.description) meta.append(element('p','',project.description));
    if(/^https?:\/\//i.test(project.url || '')){
      const link = element('a','text-link','Чуй проекта');
      link.href = project.url;
      link.target = '_blank';
      link.rel = 'noopener';
      meta.append(link);
    }
    card.append(cover,meta);
    return card;
  }

  function galleryCard(item){
    const card = element('figure','gallery-tile');
    const button = element('button','gallery-open');
    button.type = 'button';
    button.setAttribute('aria-label','Увеличи кадъра: '+item.title);
    button.append(photo(item,item.alt || item.title));
    const caption = item.description ? item.title+' · '+item.description : item.title;
    card.append(button,element('figcaption','',caption));
    return card;
  }

  const projectsGrid = document.querySelector('.project-grid');
  if(projectsGrid){
    const projectsPerPage = 5;
    const pageCount = Math.ceil(projects.length / projectsPerPage);
    const pagination = document.querySelector('.project-pagination');
    if(!projects.length){
      projectsGrid.append(element('p','','Все още няма добавени проекти.'));
    } else if(!pagination || pageCount === 1){
      projectsGrid.append(...projects.map(projectCard));
    } else {
      const prev = document.getElementById('project-prev');
      const next = document.getElementById('project-next');
      const status = document.getElementById('project-page');
      const heading = document.getElementById('projects-title');
      let page = 0;

      function renderPage(){
        const first = page * projectsPerPage;
        projectsGrid.replaceChildren(...projects.slice(first,first + projectsPerPage).map(projectCard));
        status.textContent = `Страница ${page + 1} от ${pageCount}`;
        prev.disabled = page === 0;
        next.disabled = page === pageCount - 1;
      }

      function changePage(step){
        const destination = page + step;
        if(destination < 0 || destination >= pageCount) return;
        page = destination;
        renderPage();
        heading.focus({preventScroll:true});
        heading.scrollIntoView({block:'start'});
      }

      prev.addEventListener('click',()=>changePage(-1));
      next.addEventListener('click',()=>changePage(1));
      renderPage();
      pagination.hidden = false;
    }
  }
  const galleryGrid = document.querySelector('.gallery-grid');
  if(galleryGrid){
    if(gallery.length) galleryGrid.append(...gallery.map(galleryCard));
    else galleryGrid.append(element('p','','Все още няма добавени снимки.'));
  }
})();
