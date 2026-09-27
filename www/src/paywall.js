// ====== RE.CLAIM PREMIUM (RevenueCat paywall) ======
// Configure: replace REVENUECAT_API_KEY with your project's public SDK key
// from the RevenueCat dashboard (Project Settings > API Keys).
// Create an entitlement named "premium" in RevenueCat, and attach monthly +
// annual packages to the default offering.
var REVENUECAT_API_KEY = 'REPLACE_WITH_YOUR_PUBLIC_SDK_KEY';
var PREMIUM_ENTITLEMENT = 'premium';

var _rcCustomerInfo = null;
var _rcOfferings = null;
var _rcConfigured = false;
var _paywallOpen = false;
var _rcLastError = '';

function _rcNative() {
  return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform() &&
    Capacitor.Plugins && Capacitor.Plugins.Purchases;
}

function initPaywall() {
  if (!_rcNative()) return;
  var P = Capacitor.Plugins.Purchases;
  if (!REVENUECAT_API_KEY || REVENUECAT_API_KEY.indexOf('REPLACE') === 0) return;
  P.configure({ apiKey: REVENUECAT_API_KEY }).then(function() {
    _rcConfigured = true;
    P.addCustomerInfoUpdateListener(function(info) {
      _rcCustomerInfo = info;
      if (_paywallOpen) renderPaywall();
      if (isPremium()) {
        delete _pageCache['journal'];
        render();
      }
    }).catch(function() {});
    refreshCustomerInfo();
    refreshOfferings();
  }).catch(function(e) {
    _rcLastError = (e && e.message) || 'configure failed';
  });
}

function refreshCustomerInfo() {
  if (!_rcConfigured) return;
  Capacitor.Plugins.Purchases.getCustomerInfo().then(function(res) {
    _rcCustomerInfo = res.customerInfo || null;
    if (_paywallOpen) renderPaywall();
  }).catch(function() {});
}

function refreshOfferings() {
  if (!_rcConfigured) return;
  Capacitor.Plugins.Purchases.getOfferings().then(function(o) {
    _rcOfferings = o;
    if (_paywallOpen) renderPaywall();
  }).catch(function() {});
}

function isPremium() {
  if (!_rcNative()) return true; // web PWA stays fully free; only native apps enforce paywall
  var ent = _rcCustomerInfo && _rcCustomerInfo.entitlements && _rcCustomerInfo.entitlements.active;
  return !!(ent && ent[PREMIUM_ENTITLEMENT]);
}

function _currentOffering() {
  if (_rcOfferings && _rcOfferings.current) return _rcOfferings.current;
  if (_rcOfferings && _rcOfferings.all) {
    for (var k in _rcOfferings.all) {
      if (Object.prototype.hasOwnProperty.call(_rcOfferings.all, k)) return _rcOfferings.all[k];
    }
  }
  return null;
}

function paywallPricingHTML() {
  var offering = _currentOffering();
  var pkgs = (offering && offering.availablePackages) || [];
  var monthly = null, annual = null;
  for (var i = 0; i < pkgs.length; i++) {
    var p = pkgs[i];
    var id = (p.identifier || '').toLowerCase();
    if (id.indexOf('annual') !== -1 || id.indexOf('year') !== -1) annual = p;
    else if (id.indexOf('monthly') !== -1 || id.indexOf('month') !== -1) monthly = p;
    else if (!monthly) monthly = p;
  }
  if (!monthly && !annual && pkgs.length) { monthly = pkgs[0]; }

  function priceOf(p) {
    if (!p) return '';
    var pp = p.product;
    var base = (pp && (pp.priceString || (pp.price ? String(pp.price) : ''))) || t('$4.99');
    var intro = '';
    if (pp && pp.introductoryPrice && pp.introductoryPrice.priceString) {
      intro = '<div style="font-size:10px;color:var(--accent);font-weight:700;margin-top:2px">' + t('Intro offer') + ': ' + pp.introductoryPrice.priceString + '</div>';
    }
    return '<div style="font-size:24px;font-weight:800;font-variant-numeric:tabular-nums">' + base + '</div>' + intro;
  }

  var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">';
  if (annual) {
    var annualBadge = '';
    if (monthly && monthly.product && annual.product &&
        monthly.product.price && annual.product.price && monthly.product.price >= annual.product.price * 12) {
      annualBadge = '<span style="display:inline-block;background:var(--primary);color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:999px;margin-bottom:4px">' + t('BEST VALUE') + '</span>';
    }
    h += '<div id="pw-annual" class="card" style="cursor:pointer;text-align:center;padding:14px 10px;border:2px solid var(--primary);position:relative;margin:0">' + annualBadge +
      '<div style="font-size:12px;font-weight:700;color:var(--primary);margin-bottom:4px">' + t('Annual') + '</div>' +
      priceOf(annual) +
      '<div style="font-size:10px;color:var(--muted);margin-top:4px">' + t('Billed once a year') + '</div>' +
      '</div>';
  }
  if (monthly) {
    h += '<div id="pw-monthly" class="card" style="cursor:pointer;text-align:center;padding:14px 10px;margin:0">' +
      '<div style="font-size:12px;font-weight:700;color:var(--muted);margin-bottom:4px">' + t('Monthly') + '</div>' +
      priceOf(monthly) +
      '<div style="font-size:10px;color:var(--muted);margin-top:4px">' + t('Billed monthly. Cancel anytime') + '</div>' +
      '</div>';
  }
  h += '</div>';
  h += '<div style="display:none" id="pw-annual-pkg">' + (annual ? annual.identifier : '') + '</div>';
  h += '<div style="display:none" id="pw-monthly-pkg">' + (monthly ? monthly.identifier : '') + '</div>';
  return h;
}

function _pkgByIdent(ident) {
  var offering = _currentOffering();
  if (!offering || !offering.availablePackages) return null;
  for (var i = 0; i < offering.availablePackages.length; i++) {
    if (offering.availablePackages[i].identifier === ident) return offering.availablePackages[i];
  }
  return null;
}

function renderPaywall() {
  var ov = document.getElementById('paywall-ov');
  if (!ov) return;
  var h = '<div class="overlay-content" style="max-width:440px;padding:24px">';
  if (isPremium()) {
    h += '<div style="text-align:center;padding:20px 4px">' +
      '<div style="font-size:40px;margin-bottom:6px">&#128081;</div>' +
      '<div style="font-size:20px;font-weight:800">' + t('You are Premium') + '</div>' +
      '<p style="font-size:13px;color:var(--muted);margin:8px 0 14px">' + t('Thank you for supporting Re.Claim. Every guided reflection is unlocked.') + '</p>' +
      '<button class="btn btn-primary" onclick="document.getElementById(\'paywall-ov\').remove();_paywallOpen=false" style="width:100%">' + t('Continue') + '</button>' +
      '</div>';
  } else {
    h += '<div style="text-align:center;margin-bottom:8px"><div style="font-size:40px">&#128081;</div>' +
      '<div style="font-size:20px;font-weight:800;margin-top:2px">Re.Claim ' + t('Premium') + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + t('Guided reflections that help you see the patterns others miss.') + '</div></div>';
    h += '<div class="card" style="text-align:left;font-size:12px;line-height:1.7;padding:10px 12px">';
    h += '<div>&#10003; ' + t('Daily guided journal prompts, personalised to your journey') + '</div>';
    h += '<div>&#10003; ' + t('Deep mood & pattern analysis after each entry') + '</div>';
    h += '<div>&#10003; ' + t('New reflection styles added regularly') + '</div>';
    h += '<div>&#10003; ' + t('Support an independent recovery app') + '</div>';
    h += '</div>';
    h += paywallPricingHTML();
    if (!_rcConfigured) {
      h += '<div style="font-size:11px;color:var(--danger);text-align:center;margin:4px 0 8px">' + t('Purchases are not configured yet on this build.') + '</div>';
    }
    h += '<button id="pw-cta" class="btn btn-primary" onclick="pwPurchase()" style="width:100%;font-size:14px;font-weight:700">' + t('Start Free Trial  Subscribe') + '</button>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:6px">';
    h += '<a href="#" onclick="pwRestore();return false" style="font-size:11px;color:var(--muted);text-decoration:underline">' + t('Restore Purchases') + '</a>';
    h += '<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/" target="_blank" rel="noopener" style="font-size:11px;color:var(--muted)">' + t('Terms of Use') + '</a>';
    h += '<a href="https://www.revenuecat.com/terms/" target="_blank" rel="noopener" style="font-size:11px;color:var(--muted)">RevenueCat ' + t('License') + '</a>';
    h += '</div>';
    h += '<div style="font-size:10px;color:var(--muted);text-align:center;margin-top:6px;line-height:1.5">' + t('Payment will be charged to your Apple App Store / Google Play account. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.') + '</div>';
  }
  h += '</div>';
  ov.innerHTML = h;
  var a = document.getElementById('pw-annual');
  var m = document.getElementById('pw-monthly');
  _pwSelected = a ? 'annual' : (m ? 'monthly' : _pwSelected);
  if (a) a.style.border = '2px solid var(--primary)';
  if (m) m.style.border = '2px solid var(--border)';
}

function showPaywall() {
  if (_paywallOpen) return;
  _paywallOpen = true;
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.id = 'paywall-ov';
  ov.setAttribute('role', 'dialog');
  ov.setAttribute('aria-modal', 'true');
  ov.addEventListener('click', function(e) { if (e.target === ov) { _paywallOpen = false; ov.remove(); } });
  document.body.appendChild(ov);
  renderPaywall();
  refreshCustomerInfo();
  refreshOfferings();
  if (_rcConfigured) {
    try { Capacitor.Plugins.Purchases.trackCustomPaywallImpression({ paywallId: 'reclaim-paywall' }).catch(function() {}); } catch(e) {}
  }
}

var _pwSelected = 'annual';

function pwPurchase() {
  if (!_rcConfigured) { showToast(t('Purchases are not configured yet on this build.'), 'warning'); refreshOfferings(); return; }

  var cta = document.getElementById('pw-cta');
  if (cta) cta.textContent = t('Loading...');
  var ident = (_pwSelected === 'annual')
    ? document.getElementById('pw-annual-pkg').textContent
    : document.getElementById('pw-monthly-pkg').textContent;
  if (!ident) {
    ident = document.getElementById('pw-annual-pkg').textContent || document.getElementById('pw-monthly-pkg').textContent;
    _pwSelected = ident === document.getElementById('pw-monthly-pkg').textContent ? 'monthly' : 'annual';
  }
  var pkg = _pkgByIdent(ident);
  if (!pkg) { if (cta) cta.textContent = t('Start Free Trial  Subscribe'); showToast(t('No products available yet.'), 'warning'); return; }
  var P = Capacitor.Plugins.Purchases;
  P.purchasePackage({ aPackage: pkg }).then(function(res) {
    _rcCustomerInfo = res.customerInfo || null;
    if (_paywallOpen) renderPaywall();
    if (isPremium()) {
      showToast(t('Welcome to Premium!'));
      _paywallOpen = false;
      var ov = document.getElementById('paywall-ov'); if (ov) ov.remove();
      for (var k in _pageCache) { if (Object.prototype.hasOwnProperty.call(_pageCache, k)) delete _pageCache[k]; }
      render();
    } else {
      showToast(t('Purchase was not completed.'), 'warning');
    }
  }).catch(function(e) {
    if (cta) cta.textContent = t('Start Free Trial  Subscribe');
    var msg = (e && e.message) || '';
    if (msg && msg.indexOf('cancel') !== -1) return;
    showToast(t('Purchase failed. Please try again.'), 'warning');
    console.warn('pwPurchase error:', e);
  });
}

function pwRestore() {
  if (!_rcConfigured) { showToast(t('Purchases are not configured yet on this build.'), 'warning'); return; }
  Capacitor.Plugins.Purchases.restorePurchases().then(function(res) {
    _rcCustomerInfo = res.customerInfo || null;
    if (isPremium()) {
      showToast(t('Purchases restored. Welcome back!'));
      _paywallOpen = false;
      var ov = document.getElementById('paywall-ov'); if (ov) ov.remove();
      for (var k in _pageCache) { if (Object.prototype.hasOwnProperty.call(_pageCache, k)) delete _pageCache[k]; }
      render();
    } else {
      showToast(t('No previous purchases found on this account.'), 'info');
    }
  }).catch(function(e) {
    console.warn('pwRestore error:', e);
    showToast(t('Restore failed. Please try again.'), 'warning');
  });
}

document.addEventListener('click', function(e) {
  var tgt = e.target.closest('#pw-annual, #pw-monthly');
  if (!tgt || !_paywallOpen) return;
  _pwSelected = tgt.id === 'pw-annual' ? 'annual' : 'monthly';
  var a = document.getElementById('pw-annual');
  var m = document.getElementById('pw-monthly');
  if (a) a.style.border = '2px solid ' + (_pwSelected === 'annual' ? 'var(--primary)' : 'var(--border)');
  if (m) m.style.border = '2px solid ' + (_pwSelected === 'monthly' ? 'var(--primary)' : 'var(--border)');
});

// Gate helper used by reflection features
function requirePremium(feature) {
  if (isPremium()) return true;
  showPaywall();
  if (feature) {
    var where = document.getElementById(feature);
    if (where) { try { where.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(e) {} }
  }
  return false;
}

// Init on boot (after DOM ready)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() { setTimeout(initPaywall, 500); });
} else {
  setTimeout(initPaywall, 500);
}