const element = (tag, properties = '') => {
  const el = document.createElement(tag);
  if (properties) {
    Object.keys(properties).forEach((prop) => {
      if (typeof properties[prop] === 'object') {
        Object.keys(properties[prop]).forEach((p) => {
          el[prop][p] = properties[prop][p];
        });
      } else {
        el[prop] = properties[prop];
      }
    });
  }
  return el;
};

const wrap = (textNode, tagName) => {
  var wrapper = document.createElement(tagName);
  textNode.parentNode.insertBefore(wrapper, textNode);
  wrapper.appendChild(textNode);
  return wrapper;
}

const adopt = () => {
	orphans = [];
	org = document.getElementById('org');
	org.childNodes.forEach((n) => {
		if (n.nodeType == 3 && n.textContent != "\n") {
			orphans.push(n)
		}});
	orphans.forEach((o) => {
		wrap(o, 'code');
	});
};

const removeEmpty = () => {
	document.querySelectorAll('p').forEach((p) => {
		if (p.innerText == "") {
			p.remove();
		}
	})
};

const blockToggle = (event) => {
	let block = event.target.parentNode.querySelector('code');
	if (event.target.textContent == 'show code') {
		block.style.display = 'block';
		event.target.textContent = 'hide code';
	} else {
		block.style.display = 'none';
		event.target.textContent = 'show code';
	}
};

const prependBlock = () => {
	let prepend = element('p', {className: 'toggleblock', textContent: 'show code'});
	prepend.addEventListener('click', blockToggle);
	return prepend;
};

const processBlocks = () => {
	document.querySelectorAll('pre code').forEach((block) => {
		hljs.highlightBlock(block);
		if (!block.className.includes('language-json')) {
			let prepend = prependBlock();
			block.parentNode.insertBefore(prepend, block);
			block.style.display = 'none';
		}
		adopt();
		removeEmpty();
	});
};

const onlyHeaders = () => {
	document.querySelectorAll("#org>*:not(h3)").forEach((n) => {n.style.display = "none"});
};

const toggle = (event) => {
	let id = event.target.id;
	let toggleNodes = [];
	let next = document.querySelectorAll(`#${id} ~ *`);
	for (i=0; i<next.length; i++) {
		if (next[i].localName == "h3") {break;}
		else {toggleNodes.push(next[i])}
	};
	if (toggleNodes.length > 0) {
		let state;
		if (toggleNodes[0].style.display == "block") {
			state = "none";
			event.target.className = "inactive";
		}	else {
			state = "block";
			event.target.className = "active";
		}
		toggleNodes.forEach((n) => {n.style.display = state})
	}
};

const toggleHeaders = () => {
	document.querySelectorAll('#org>h3').forEach((h) => {
		h.addEventListener('click', toggle)
	})
};

const processOutline = () => {
	onlyHeaders();
	toggleHeaders()
}

const postProcessing = () => {
	processBlocks();
	processOutline();
}

const init = (id) => {
	// const url = `${base}${id}`;
  fetch(id, {
    method: 'GET',
    redirect: "follow",
    mode: "cors",
  })
    .then((response) => {
			if (response.headers.get("content-type").indexOf("text/plain") !== -1) {
				return response.text();
			} else {
				fallback();
			}
		})
		.then((data) => {
      var orgParser = new Org.Parser();
      var orgDocument = orgParser.parse(data);
      var orgHTMLDocument = orgDocument.convert(Org.ConverterHTML, {
				headerOffset: 2,
				exportFromLineNumber: false,
				suppressSubScriptHandling: false,
				suppressAutoLink: false
      });
      const orgtainer = document.getElementById('org');
      orgtainer.innerHTML = orgHTMLDocument.contentHTML.toString();
			orgtainer.style.display = "block";
			document.getElementById('message').style.display = "none";
			postProcessing();
    });
	if (document.getElementById('org').children.length == 0) {
		fallback();
	}
};

const fallback = () => {
	if (document.getElementById('loader') == null) {
		const message = document.getElementById('message');
		loader = element('div', {id: 'loader'})
		bar = element('div', {id: 'bar'})
		loader.appendChild(bar);
		
		explain = element('div', {className: 'explain'});
		explain.appendChild(
			element('span', {textContent: "You can display an org-mode file by appending its url to this address like "}));
		explain.appendChild(
			element('a', {textContent: "this", href: ".?https://raw.githubusercontent.com/mauforonda/emacs/master/readme.org"}));
		
		document.getElementById('org').style.display = "none";
		message.appendChild(loader);
		message.appendChild(explain);
	}
};

const id = window.location.search.substring(1);

if (id != "" && id.slice(-4,) == ".org") {
	init(id)
} else {
	fallback()
}
