(function(){
  var t=localStorage.getItem('theme');
  if(t==='dark')document.documentElement.classList.add('dark');
  else if(t==='light')document.documentElement.classList.remove('dark');
  else if(typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.classList.add('dark');}
})();
