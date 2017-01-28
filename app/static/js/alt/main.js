var socket = io.connect('//' + document.domain + ':' + location.port + '/alt');
var md = new showdown.Converter({tables: true, extensions: ['xssfilter']});
var user = {};  // user info


var menu_home = {  // the menu for home_*
  controller: function () {},
  view: function (ctrl) {
    return [m('li.pure-menu-item', {active: (m.route() == '/' || m.route() == '/hot') ? true : false}, m('a.pure-menu-link[href="/all/hot"]', {config: m.route},'Hot')),
            m('li.pure-menu-item', {active: (m.route() == '/new') ? true : false}, m('a.pure-menu-link[href="/new"]', {config: m.route},'New')),
            m('li.pure-menu-item', m('a.pure-menu-link[href="/all/new"]', {config: m.route}, 'Recent'))];
  }
};

var menu_all = {  // the menu for all_*
  controller: function () {},
  view: function (ctrl) {
    return [m('li.pure-menu-item', m('span', m('b', 'All'))),
						m('li.pure-menu-item', {active: (m.route() == '/all/hot') ? true : false}, m('a.pure-menu-link[href="/all/hot"]', {config: m.route},'Hot')),
            m('li.pure-menu-item', {active: (m.route() == '/all/top') ? true : false}, m('a.pure-menu-link[href="/all/top"]', {config: m.route},'Top')),
            m('li.pure-menu-item', {active: (m.route() == '/all/new') ? true : false}, m('a.pure-menu-link[href="/all/new"]', {config: m.route}, 'New'))];
  }
};

var menu_sub = {  // the menu for sub_*
  controller: function () {return {sub: m.route.param("sub")};},
  view: function (c) {
    if (current_sub.name) {
      switch(m.route()) {  // could use regexp here
        case '/s/' + c.sub:
          ep = current_sub.sort;
          break;
        case '/s/' + c.sub + '/hot':
          ep = 'hot'; break;
        case '/s/' + c.sub + '/new':
          ep = 'new'; break;
        case '/s/' + c.sub + '/top':
          ep = 'top'; break;
      }
      return [m('li.pure-menu-item', m('span', m('b', current_sub.name))),
  						m('li.pure-menu-item', {active: (ep == 'hot') ? true : false}, m('a.pure-menu-link', {href: '/s/' + current_sub.name + '/hot', config: m.route},'Hot')),
              m('li.pure-menu-item', {active: (ep == 'top') ? true : false}, m('a.pure-menu-link', {href: '/s/' + current_sub.name + '/top', config: m.route},'Top')),
              m('li.pure-menu-item', {active: (ep == 'new') ? true : false}, m('a.pure-menu-link', {href: '/s/' + current_sub.name + '/new', config: m.route}, 'New'))];
    }
  }
};


var menu_user = {  // the menu for user_*
  controller: function (ctrl) {return {user: m.route.param("user")};},
  view: function (ctrl) {
      return [m('li.pure-menu-item', m('span', m('b', m.route.param("user")))),
              m('li.pure-menu-item', {}, m('a.pure-menu-link', {href: '/u/' + m.route.param("user") + '/posts', config: m.route},'Posts')),
              m('li.pure-menu-item', {}, m('a.pure-menu-link', {href: '/u/' + m.route.param("user") + '/comments', config: m.route},'Comments'))];
              // m('li.pure-menu-item', {}, m('a.pure-menu-link', {href: '/u/' + m.route.param("user") + '/saved', config: m.route}, 'Saved'))];
  }
};

m.route.mode = "hash";

/* routing */
m.routes('/', {// default route
    /* Frontpage */
    '/': {'#th-main': home_hot, '#th-menu': menu_home},
    '/all/hot': {'#th-main': all_hot, '#th-menu': menu_all},
    '/all/new': {'#th-main': all_new, '#th-menu': menu_all},
    '/all/top': {'#th-main': all_top, '#th-menu': menu_all},
    '/top': {'#th-main': home_top, '#th-menu': menu_home},
    '/new': {'#th-main': home_new, '#th-menu': menu_home},
    '/hot': {'#th-main': home_hot, '#th-menu': menu_home},
    /* Frontpage page numbers */
    '/all/hot/:page': {'#th-main': all_hot, '#th-menu': menu_all},
    '/all/new/:page': {'#th-main': all_new, '#th-menu': menu_all},
    '/all/top/:page': {'#th-main': all_top, '#th-menu': menu_all},
    '/top/:page': {'#th-main': home_top, '#th-menu': menu_home},
    '/new/:page': {'#th-main': home_new, '#th-menu': menu_home},
    '/hot/:page': {'#th-main': home_hot, '#th-menu': menu_home},

    /* User */
    '/login': {'#th-main': login},
    '/register': {'#th-main': register},
    '/u/:user': {'#th-main': view_user, '#th-menu': menu_user},
    '/u/:user/posts': {'#th-main': view_user_posts, '#th-menu': menu_user},
    // TODO '/u/:user/comments': {'#th-main': view_user_comments, '#th-menu': menu_user},
    // TODO '/u/:user/saved': {'#th-main': view_user_saved, '#th-menu': menu_user},
    /* User page numbers */
    '/u/:user/posts/:page': {'#th-main': view_user_posts, '#th-menu': menu_user},
    // TODO '/u/:user/comments/:page': {'#th-main': view_user_comments, '#th-menu': menu_user},
    // TODO '/u/:user/saved/:page': {'#th-main': view_user_saved, '#th-menu': menu_user},

    /* Sub */
    '/s/:sub': {'#th-main': sub_auto, '#th-menu': menu_sub},
    '/s/:sub/hot': {'#th-main': sub_hot, '#th-menu': menu_sub},
    '/s/:sub/top': {'#th-main': sub_top, '#th-menu': menu_sub},
    '/s/:sub/new': {'#th-main': sub_new, '#th-menu': menu_sub},
    /* Sub page numbers */
    '/s/:sub/hot/:page': {'#th-main': sub_hot, '#th-menu': menu_sub},
    '/s/:sub/top/:page': {'#th-main': sub_top, '#th-menu': menu_sub},
    '/s/:sub/new/:page': {'#th-main': sub_new, '#th-menu': menu_sub},

    /* Post */
    '/s/:sub/:pid': {'#th-main': view_post, '#th-menu': menu_sub}
  });

/* User view thingy controller */
var user = {};
user.udata = {};

user.controller = function(){
  this.logout = function() {
    m.request({
      method: "POST",
      url: "/do/logout",
      data: {j: true, csrf_token: document.getElementById('csrf_token').value}
    });
  };
  this.listen = function() {
    m.startComputation();
    socket.on("uinfo", function (data) {
      user.udata = data;
      m.endComputation();
    });
  }();
};

user.view = function (ctrl){  // login thingy
  var u = user.udata;
	if(u.loggedin === undefined) {
		return m("div.cw-items", 'Loading...');
	}
  return m("div.cw-items", {}, function(){
          if (u.loggedin){
                return [m('a', {href: '/u/' + u.name, class: 'smallcaps', config: m.route}, u.name),
                m('span', {class: 'separator'}),
                m('abbr', {title: 'Phuks taken', class: 'bold'}, u.taken),
                m('span', {class: 'separator'}),
                m('abbr', {title: 'Phuks given'}, u.given),
                m('span', {class: 'separator'}),
                m('a', {class: 'glyphbutton sep', href: '#'},
                  m('i', {class: 'fa fa-sliders', title: 'Settings'})),
                m('a', {class: 'glyphbutton sep'},
                  m('i', {class: 'fa ' + function(){
                                  if (u.ntf === 0){
                                    return 'fa-envelope-o';
                                  }else{
                                    return 'fa-envelope hasmail';
                                  }
                                }(), title: 'Messages'})),
                m('a', {class: 'glyphbutton', id: 'toggledark'},
                  m('i', {class: 'fa fa-lightbulb-o', title: 'Toggle light mode', onclick: toggle_darkmode})),
                m('span', {class: 'separator'}),
                m('a[href="#"]', {onclick: ctrl.logout}, 'Log out')];
          }else{
            return [m('a[href="/login"]', {config: m.route}, 'Log in'),
                    m('span.separator'),
                    m('a[href="/register"]', {config: m.route}, 'Register')];
          }
        }()
      );
};

var subar = {};
subar.controller = function () {
	var ctrl = {};
	m.request({
		method: 'GET',
		url: '/do/get_subscriptions'
	}).then(function(res) {
			ctrl.subs = res.subscriptions;
			m.endComputation();
	});
	return ctrl;
};
subar.view = function (ctrl){ // sub bar
	x = [];
	for( var i in ctrl.subs ){
		x.push(m('li.subinthebar', m('a', {config: m.route, href: '/s/' + ctrl.subs[i]}, ctrl.subs[i].toUpperCase())));
	}
	return x;
};

m.module(document.getElementById('th-uinfo'), {controller: user.controller, view: user.view});
m.module(document.getElementById('th-subar'), {controller: subar.controller, view: subar.view});
