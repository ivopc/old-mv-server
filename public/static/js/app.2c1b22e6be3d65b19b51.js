webpackJsonp([12],{"/XXx":function(t,e){},NHnr:function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var a=n("/5sW"),o=n("cEaa"),i={render:function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"col-md-2"},[n("nav",{staticClass:"navbar navbar-expand-lg navbar-dark mt-3"},[t._m(0),t._v(" "),n("div",{staticClass:"collapse navbar-collapse",attrs:{id:"navbar"}},[n("ul",{staticClass:"navbar-nav flex-column ml-2",attrs:{id:"valle-nav-bar"}},[n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-danger btn-block",attrs:{to:"/play",type:"button"}},[t._v(t._s(t.wordlist.navbar.PLAY[t.lang]))])],1),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-light btn-block",attrs:{to:"/",type:"button"}},[t._v(t._s(t.wordlist.navbar.HOME[t.lang]))])],1),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-light btn-block",attrs:{to:"/premium",type:"button"}},[t._v(t._s(t.wordlist.navbar.PREMIUM_MARKET[t.lang]))])],1),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("a",{staticClass:"btn btn-outline-light btn-block",attrs:{href:"/marketplace",type:"button",target:"_blank"}},[t._v(t._s(t.wordlist.navbar.MARKET_PLACE[t.lang]))])]),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-light btn-block",attrs:{to:"/community",type:"button"}},[t._v(t._s(t.wordlist.navbar.COMMUNITY[t.lang]))])],1),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-light btn-block",attrs:{to:"/config",type:"button"}},[t._v(t._s(t.wordlist.navbar.CONFIG[t.lang]))])],1),t._v(" "),n("li",{staticClass:"nav-item pb-2 mt-2"},[n("router-link",{staticClass:"btn btn-outline-light btn-block",attrs:{to:"/logout",type:"button"}},[t._v(t._s(t.wordlist.navbar.LOGOUT[t.lang]))])],1)])])])])},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("button",{staticClass:"navbar-toggler ml-auto",attrs:{type:"button","data-toggle":"collapse","data-target":"#navbar"}},[e("span",{staticClass:"navbar-toggler-icon"})])}]};var r=n("VU/8")({name:"Header",created:function(){},mounted:function(){},methods:{}},i,!1,function(t){n("esYF")},"data-v-5b19c7b9",null).exports,s=n("Xxa5"),l=n.n(s),c=n("Dd8w"),u=n.n(c),m=n("exGp"),d=n.n(m),p=n("zPwy"),h=n.n(p),b={name:"GameClient",data:function(){return{gameStarted:!1,containerId:"game",gameInstance:null,socket:null,clientTokens:[{uid:"9",token:"WdLhAqw6vQrZg4MH5zBIFxYkrASJTjavo6R47AsHPbgGP10IKFJo2B012d1bTVUGx06wW3DkEDD6JD2h3o7ApSVOzpknmijXYggLu3jHe7OoKpSRqbV0uKq0oKaW4D8MafeAlm93XHWwG6EY2UxBUg"},{uid:"2",token:"eYGrxqByiJ61Y7trwdaSrlUoF4aFDA945FmWFPTWH0ARDk8b8AmAFm9jpiUt7FmQdsY52vLnTnrkC5zsTbJXJG0JMNBJLI0PmT8c4htyzQCwtvJBMtBPWErVnGkpFQ1QYOAqrGmhITZd3IVpKV6Pqv"}],currentClient:localStorage.getItem("index")||0}},created:function(){this.eventBus.$on("call-client",this.callClient),this.eventBus.$on("hide-client",this.hideClient),this.eventBus.$on("navigate-to-other-pages",this.navigateToOtherPages)},methods:{callClient:function(){this.gameStarted?(this.eventBus.$emit("hide-elements"),this.$el.style.display="block"):this.appendGameClient()},hideClient:function(){this.$el.style.display="none"},navigateToOtherPages:function(t){var e=this;this.eventBus.$off("call-client"),this.hideClient(),this.eventBus.$emit("show-elements"),this.$router.push({name:t.name}),this.$nextTick(function(){e.eventBus.$on("call-client",e.callClient)})},appendGameClient:function(){var t=this;return d()(l.a.mark(function e(){var a;return l.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return t.eventBus.$emit("hide-elements"),e.next=3,Promise.all([n.e(0),n.e(1)]).then(n.bind(null,"sZ7w"));case 3:a=e.sent,t.gameInstance=a.launch(t.containerId),t.gameStarted=!0,t.socket=h.a.connect(u()({query:{uid:String($Authentication.id),token:$Authentication.token.auth},hostname:location.hostname},{})),t.socket.on("99",function(e){return t.handleInit(e)});case 10:case"end":return e.stop()}},e,t)}))()},handleInit:function(t){switch(t.state){case 0:this.gameInstance.scene.start("boot",{state:"overworld",data:{CurrentMap:t.param.map,CurrentMonsters:t.param.monsters,CurrentItems:t.param.items},socket:this.socket,auth:{uid:$Authentication.id},player:{sprite:t.param.sprite,position:{facing:t.param.position.facing,x:Number(t.param.position.x),y:Number(t.param.position.y)},stop:!1,stepFlag:0,moveInProgress:!1},notify:t.param.notify,wild:t.param.wild,flag:t.param.flag,tamers:t.param.tamers,manager:{audio:null,connection:{overworld:!1,battle:!1,battleComplementar:!1}},$el:this.$el,$eventBus:this.eventBus});break;case 1:this.gameInstance.scene.start("boot",{state:"battle",data:{},socket:this.socket,auth:{uid:$Authentication.id},param:t.param,manager:{audio:null,connection:{overworld:!1,battle:!1,battleComplementar:!1}},$el:this.$el,$eventBus:this.eventBus})}}}},v={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",[e("section",{attrs:{id:this.containerId}},[this._m(0)])])},staticRenderFns:[function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"chat"}},[e("input",{attrs:{"data-type":"chat",type:"text",maxlength:"45"}})])}]};var f={name:"App",components:{Header:r,GameClient:n("VU/8")(b,v,!1,function(t){n("/XXx")},"data-v-1bb67125",null).exports},data:function(){return{hidden:!1}},created:function(){var t=this;this.eventBus.$on("show-elements",function(){t.hidden=!1}),this.eventBus.$on("hide-elements",function(){t.hidden=!0})}},g={render:function(){var t=this.$createElement,e=this._self._c||t;return e("div",{attrs:{id:"app"}},[this.hidden?this._e():e("div",{staticClass:"row"},[e("Header"),this._v(" "),e("router-view")],1),this._v(" "),e("GameClient")],1)},staticRenderFns:[]};var C=n("VU/8")(f,g,!1,function(t){n("gOLR")},null,null).exports,P=n("/ocq"),_=function(t){return function(){return n("Opzk")("./"+t+".vue")}};a.a.use(P.a);var y=[{path:"/",name:"Index",component:_("Index"),meta:{title:"Monster Valle"}},{path:"/play",name:"Play",component:_("Play"),meta:{title:"Monster Valle - Play"}},{path:"/profile",name:"Profile",component:_("Profile"),meta:{title:"Monster Valle - Perfil"}},{path:"/profile/:id",name:"SpecificProfile",component:_("SpecificProfile")},{path:"/premium",name:"PremiumMarket",component:_("PremiumMarket"),meta:{title:"Monster Valle - Premium Market"}},{path:"/community",name:"Community",component:_("Community"),meta:{title:"Monster Valle - Comunidade"}},{path:"/statistics",name:"Statistics",component:_("Statistics")},{path:"/config",name:"Config",component:_("Config"),meta:{title:"Monster Valle - Configurações"}},{path:"/logout",name:"Logout",component:_("Logout")}],k=new P.a({mode:"history",routes:y}),E=n("NYxO"),M=(n("mtWM"),n("gyMJ")),w={state:{player_data:{}},getters:{player_data:function(t){return t.player_data}},actions:{fetchPlayerData:function(t){console.log("Dispatchou"),M.a.post("/routes/index",{auth:$Authentication.token.csrf}).then(function(e){t.commit("SET_PLAYER_DATA",e.data)})}},mutations:{SET_PLAYER_DATA:function(t,e){t.player_data=e}}};a.a.use(E.a);var A=new E.a.Store({modules:{home:w},strict:!1}),S=n("aFK5"),O=n.n(S);a.a.mixin({data:function(){return{lang:$Authentication.lang,wordlist:o.a}},methods:{injectWords:function(t,e){for(var n=O()(e),a=0;a<n.length;a++)t=t.replace(new RegExp("{"+n[a]+"}","gi"),e[n[a]]);return t}}});n("K3J8"),n("qb6w"),n("ao2D"),n("rk6y"),n("VaBq");a.a.config.productionTip=!1,a.a.prototype.eventBus=new a.a,k.beforeEach(function(t,e,n){document.title=t.meta.title,n()}),new a.a({el:"#app",router:k,store:A,render:function(t){return t(C)}})},Opzk:function(t,e,n){var a={"./Community.vue":["sP7N",3,0],"./Config.vue":["kJxZ",5],"./Index.vue":["mlqX",2],"./Logout.vue":["BYp6",4,0],"./Play.vue":["f2fA",9],"./PremiumMarket.vue":["38se",8,0],"./Profile.vue":["Twgf",6,0],"./SpecificProfile.vue":["CW26",10,0],"./Statistics.vue":["PTxu",7,0]};function o(t){var e=a[t];return e?Promise.all(e.slice(1).map(n.e)).then(function(){return n(e[0])}):Promise.reject(new Error("Cannot find module '"+t+"'."))}o.keys=function(){return Object.keys(a)},o.id="Opzk",t.exports=o},VaBq:function(t,e){},ao2D:function(t,e){},cEaa:function(t,e,n){"use strict";e.a={navbar:{PLAY:{br:"Jogar",en:"Play"},HOME:{br:"Início",en:"Home"},PROFILE:{br:"Perfil",en:"Profile"},PREMIUM_MARKET:{br:"Premium Market",en:"Premium Market"},MARKET_PLACE:{br:"Market Place",en:"Market Place"},COMMUNITY:{br:"Comunidade",en:"Community"},STATISTICS:{br:"Estatísticas",en:"Statistics"},CONFIG:{br:"Configurações",en:"Config"},LOGOUT:{br:"Sair",en:"Logout"}},home:{SHOW:{br:"Bem-vindo, {nickname}. Monster Valle é um jogo role-playing (RPG) MMO (Massively Multiplayer Online) de batalha em turnos com monstros colecionáveis, um dos seus focos é o farming em busca de itens mais raros e valiosos e monstros mais fortes.",en:"Welcome, {nickname}. Monster Valle is a role-playing (RPG) MMO (Massively Multiplayer Online) game, width turn-based battle witch collectable monsters, one of the focus is the farming in search of valuable items and stronger monsters."},SHOW2:{br:"Estamos na versão pre-alpha, portanto, se houver bugs e erros e você encontrá-los a staff te recompensará, e de acordo com a gravidade do bug a recompensa poderá ser ainda maior.",en:"We're in pre-alpha, if have bugs and errors and you found them the staff will reward you, and according of seriousness of bug you reward will be better."}},community:{TITLE:{br:"Nossa Comunidade",en:"Community"},FACEBOOK:{br:"Página do Facebook",en:"Facebook Page"},FACE_GROUP:{br:"Grupo do Facebook",en:"Facebook Group"},YOUTUBE:{br:"Canal Youtube",en:"Youtube Channel"},DISCORD:{br:"Discord",en:"Discord"}},config:{CONFIG:{br:"Configurações",en:"Configuration"},CHANGE_EMAIL:{br:"Modificar E-mail",en:"Change E-mail"},CHANGE_PASSWORD:{br:"Modificar Senha",en:"Change Password"},NEW_EMAIL:{br:"Novo E-mail",en:"New E-mail"},PASSWORD:{br:"Senha",en:"Password"},PASSWORD_CONFIRM:{br:"Confirme sua Senha",en:"Confirm your Password"},NEW_PASSWORD:{br:"Nova Senha",en:"New Password"},REPEAT_PASSWORD:{br:"Repita sua nova senha",en:"Repeat your new password"},CONFIRM_CURRENT_PASSWORD:{br:"Confirme sua Senha Atual",en:"Confirm your current password"},CHANGE:{br:"Modificar",en:"Change"},EMPTY_INPUTS:{br:"Preencha todos os campos corretamente!",en:"Complete all the fields correctly!"},EMAIL_IN_USE:{br:"O e-mail está em uso!",en:"E-mail already in use!"},PASSWORD_NOT_EQUALS:{br:"Senha não é igual!",en:"Password is not equals!"},PASSWORD_NOT_EQUALS2:{br:"A senha não coincide com a registrada!",en:"The password don't match with registered!"},CHANGE_SUCCESS:{br:"Alterado com sucesso!",en:"Changed with success!"}}}},esYF:function(t,e){},gOLR:function(t,e){},gyMJ:function(t,e,n){"use strict";var a=n("mtWM"),o=n.n(a);e.a=o.a.create({baseURL:Object({NODE_ENV:"production",baseURL:"/",gameClientBaseURL:"/"}).httpClientBaseURL||"/"})},qb6w:function(t,e){}},["NHnr"]);
//# sourceMappingURL=app.2c1b22e6be3d65b19b51.js.map