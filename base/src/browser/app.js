import HTMLBuilder from 'fibo-html-component';

import './style/app.scss';

const b = new HTMLBuilder();

const bodyDiv = document.getElementById('body');
   
const sounds = {
  headers: [
    'name', 
    'description', 
    'episode',
    'actions',
  ],
  data: [
    {
      name: "Roparzh, faut pas déconner",
      description: "Mais faut pas déconner, ils y sont pour rien",
      episode: "La révolte III"
    },
    {
      name: "Guethenoc, facilite pas les négociations",
      description: "Quand on gueule sans savoir pourquoi, ça facilite pas les négociations dérrière...",
      episode: "La révolte III",
    },
    {
      name: "Arthur, quand on est gentil on prête",
      description: "Oui, et bien moi je vous donne l'ordre de lui prêter votre corne, parce que quand on est gentil on prête",
      episode: "Les Tacticiens 2ème partie",
    }
  ],
};

async function app() {
  const d = await createDocumentFromURL('/components');
  console.log(d);

  b.addResourcesFromDocument(d);

  b.preparePage('p', document);

  b.buildPage('p', { sounds });
  //b.build();
}

app();
/*

async function app() {
  await loadHTMLFromUrl('/components.html');

  const submitButton = (row, elem, data) => {
    elem.addEventListener('click', () => {
      console.log(row, elem, data);
      let parent = elem.parentNode;

      while (! parent.matches('tr')) {
        parent = parent.parentNode;
      }

      const fields = parent.querySelectorAll('input, textarea, select');

      const fdata = {};

      for (const f of fields) {
        fdata[f.name] = f.value;
      }

      console.log(fdata);

      parent.replaceWith(row);
    });
  };

  const editLink = (elem, data) => {
    elem.addEventListener('click', () => {
      let row = elem.parentNode;

      while (! row.matches('tr')) {
        row = row.parentNode;
      }

      const frag = document.createDocumentFragment();

      createComponent(frag, 'edit-row', data, {
        callbacks: {
          submitButton: submitButton.bind(null, row)
        }
      });

      row.replaceWith(frag);
    });
  };

  componentLoad().then(() => {
    createComponent(document.body, 'table', source, {
      callbacks: {
        editLink,
        submitButton,
      }
    });
  });
};

app();
*/
