/**
 * MaskingOPS Demo Mode
 * Adds simulated backend feedback, toast notifications, progress animations,
 * and a demo banner to make prototypes feel like a live application.
 */
(function() {
  'use strict';

  // ── Demo Banner ──
  const banner = document.createElement('div');
  banner.id = 'demo-banner';
  banner.innerHTML = '<i class="fas fa-flask" style="margin-right:6px;"></i> DEMO VERSION <span style="opacity:0.7; font-weight:400; margin-left:8px;">Simulated data &middot; No backend connected</span>';
  Object.assign(banner.style, {
    position: 'fixed', bottom: '0', left: '0', right: '0', zIndex: '9999',
    background: 'linear-gradient(90deg, #0f62fe 0%, #8a3ffc 100%)',
    color: '#fff', textAlign: 'center', padding: '6px 16px',
    fontSize: '11px', fontWeight: '600', fontFamily: "'IBM Plex Sans', sans-serif",
    letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  });
  document.body.appendChild(banner);

  // Adjust body padding so content isn't hidden behind banner
  document.body.style.paddingBottom = '32px';

  // ── Toast Notification System ──
  const toastContainer = document.createElement('div');
  toastContainer.id = 'demo-toasts';
  Object.assign(toastContainer.style, {
    position: 'fixed', top: '60px', right: '20px', zIndex: '9998',
    display: 'flex', flexDirection: 'column', gap: '8px',
    pointerEvents: 'none', maxWidth: '360px'
  });
  document.body.appendChild(toastContainer);

  // Toast CSS
  const toastStyle = document.createElement('style');
  toastStyle.textContent = `
    .demo-toast {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 12px 16px; border-radius: 0;
      font-family: 'IBM Plex Sans', sans-serif; font-size: 12px;
      color: #161616; background: #fff; border-left: 3px solid #0f62fe;
      box-shadow: 0 4px 16px rgba(0,0,0,0.12);
      animation: demoToastIn 0.3s ease-out;
      pointer-events: auto; max-width: 360px; line-height: 1.4;
    }
    .demo-toast.success { border-left-color: #198038; }
    .demo-toast.warning { border-left-color: #f1c21b; }
    .demo-toast.error   { border-left-color: #da1e28; }
    .demo-toast.info    { border-left-color: #0f62fe; }
    .demo-toast .toast-icon {
      flex-shrink: 0; width: 20px; height: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    }
    .demo-toast .toast-icon.success { color: #198038; }
    .demo-toast .toast-icon.warning { color: #f1c21b; }
    .demo-toast .toast-icon.error   { color: #da1e28; }
    .demo-toast .toast-icon.info    { color: #0f62fe; }
    .demo-toast .toast-content { flex: 1; }
    .demo-toast .toast-title { font-weight: 600; margin-bottom: 2px; }
    .demo-toast .toast-msg { color: #525252; font-size: 11px; }
    .demo-toast .toast-close {
      flex-shrink: 0; background: none; border: none; color: #525252;
      cursor: pointer; font-size: 14px; padding: 0; line-height: 1;
    }
    .demo-toast .toast-progress {
      height: 2px; background: #e0e0e0; margin-top: 8px; border-radius: 1px;
      overflow: hidden;
    }
    .demo-toast .toast-progress-fill {
      height: 100%; background: #0f62fe; width: 0%;
      transition: width 0.3s ease;
    }
    @keyframes demoToastIn {
      from { opacity: 0; transform: translateX(40px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes demoToastOut {
      from { opacity: 1; transform: translateX(0); max-height: 200px; margin-bottom: 8px; }
      to   { opacity: 0; transform: translateX(40px); max-height: 0; margin-bottom: 0; padding: 0; }
    }
  `;
  document.head.appendChild(toastStyle);

  const iconMap = {
    success: 'fa-check-circle',
    warning: 'fa-exclamation-triangle',
    error: 'fa-times-circle',
    info: 'fa-info-circle'
  };

  function showToast(type, title, message, duration) {
    duration = duration || 4000;
    const toast = document.createElement('div');
    toast.className = 'demo-toast ' + type;
    toast.innerHTML =
      '<div class="toast-icon ' + type + '"><i class="fas ' + iconMap[type] + '"></i></div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + title + '</div>' +
        '<div class="toast-msg">' + message + '</div>' +
      '</div>' +
      '<button class="toast-close" onclick="this.parentElement.remove()">&times;</button>';
    toastContainer.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'demoToastOut 0.3s ease-in forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
    return toast;
  }

  function showProgressToast(title, message, durationMs) {
    durationMs = durationMs || 3000;
    const toast = document.createElement('div');
    toast.className = 'demo-toast info';
    toast.innerHTML =
      '<div class="toast-icon info"><i class="fas fa-spinner fa-spin"></i></div>' +
      '<div class="toast-content">' +
        '<div class="toast-title">' + title + '</div>' +
        '<div class="toast-msg">' + message + '</div>' +
        '<div class="toast-progress"><div class="toast-progress-fill"></div></div>' +
      '</div>';
    toastContainer.appendChild(toast);
    const fill = toast.querySelector('.toast-progress-fill');
    // Animate progress
    let elapsed = 0;
    const interval = setInterval(function() {
      elapsed += 50;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      fill.style.width = pct + '%';
      if (elapsed >= durationMs) {
        clearInterval(interval);
        toast.querySelector('.toast-icon').innerHTML = '<i class="fas fa-check-circle"></i>';
        toast.querySelector('.toast-icon').className = 'toast-icon success';
        toast.className = 'demo-toast success';
        toast.querySelector('.toast-title').textContent = title + ' - Complete';
        setTimeout(function() {
          toast.style.animation = 'demoToastOut 0.3s ease-in forwards';
          setTimeout(function() { toast.remove(); }, 300);
        }, 2000);
      }
    }, 50);
    return toast;
  }

  // ── Attach to buttons ──
  // Make all .btn-primary buttons trigger demo feedback
  document.querySelectorAll('.btn-primary').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();

      if (text.includes('New Masking Job') || text.includes('New Job')) {
        showProgressToast('Creating Job', 'Initializing masking pipeline...', 2500);
        setTimeout(function() {
          showToast('success', 'Job Created', 'New masking job queued. Processing will begin shortly.');
        }, 3000);
      } else if (text.includes('Run Benchmark')) {
        showProgressToast('Running Benchmark', 'Estimating poses on 2 videos with 3 estimators...', 4000);
        setTimeout(function() {
          showToast('success', 'Benchmark Complete', 'All metrics computed. View results in the Results tab.');
        }, 4500);
      } else if (text.includes('Deposit') || text.includes('Archive')) {
        showProgressToast('Preparing Package', 'Bundling files and generating metadata...', 3000);
        setTimeout(function() {
          showToast('success', 'Package Ready', 'Dataset package created. Ready for deposit to DANS.');
        }, 3500);
      } else if (text.includes('Upload') || text.includes('Start')) {
        showProgressToast('Uploading', 'Processing video file...', 3500);
        setTimeout(function() {
          showToast('success', 'Upload Complete', 'Video added to pipeline. Ready for de-identification.');
        }, 4000);
      } else if (text.includes('Apply') || text.includes('Save')) {
        showToast('success', 'Settings Saved', 'Configuration updated successfully.');
      } else if (text.includes('New Experiment')) {
        showToast('info', 'New Experiment', 'Configure your benchmark parameters below.');
      } else {
        showToast('info', 'Action Received', 'This action would be processed by the MaskingOPS backend.');
      }
    });
  });

  // Make secondary buttons also give feedback
  document.querySelectorAll('.btn-secondary').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var text = this.textContent.trim();
      if (text.includes('Export') || text.includes('Download') || text.includes('CSV')) {
        showToast('info', 'Export Started', 'Generating file for download...');
        setTimeout(function() {
          showToast('success', 'Download Ready', 'File exported successfully (demo mode - no actual file).');
        }, 1500);
      } else if (text.includes('History')) {
        showToast('info', 'Run History', 'Showing previous benchmark experiments.');
      } else {
        showToast('info', 'Action', text + ' (demo mode)');
      }
    });
  });

  // Ghost buttons
  document.querySelectorAll('.btn-ghost').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      var text = this.textContent.trim();
      if (text.includes('CSV') || text.includes('PDF') || text.includes('Report')) {
        e.preventDefault();
        showToast('info', 'Exporting', text + ' generation started (demo mode).');
      }
    });
  });

  // ── Notification bell ──
  document.querySelectorAll('[title="Notifications"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      showToast('info', 'Notifications', '3 pending utility reviews require your attention.');
      setTimeout(function() {
        showToast('warning', 'Job Alert', 'Interview_P003 masking stalled at frame 842. Manual review needed.');
      }, 800);
    });
  });

  // ── Settings button ──
  document.querySelectorAll('[title="Settings"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      showToast('info', 'Settings', 'Pipeline configuration panel would open here.');
    });
  });

  // ── Help button ──
  document.querySelectorAll('[title="Help"]').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      showToast('info', 'Documentation', 'Opening MaskingOPS tutorial guide...');
    });
  });

  // ── Table row clicks ──
  document.querySelectorAll('.table-row').forEach(function(row) {
    row.style.cursor = 'pointer';
    row.addEventListener('click', function() {
      var fileName = this.querySelector('.col-file') ?
        this.querySelector('.col-file').textContent.trim().split('\n')[0].trim() : 'item';
      showToast('info', 'Opening ' + fileName, 'Loading details view...');
    });
  });

  // ── Filter pills ──
  document.querySelectorAll('.filter-pill').forEach(function(pill) {
    pill.addEventListener('click', function() {
      var filter = this.textContent.trim();
      document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      showToast('info', 'Filter Applied', 'Showing: ' + filter);
    });
  });

  // ── Sidebar items ──
  document.querySelectorAll('.sidebar-item[href="#"]').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      var label = this.textContent.trim();
      showToast('info', label, 'This feature is available in the full version.');
    });
  });

  // ── Decision options (QA review) ──
  document.querySelectorAll('.decision-option').forEach(function(opt) {
    opt.addEventListener('click', function() {
      var decision = this.textContent.trim().split('\n')[0].trim();
      if (decision.includes('Approve')) {
        showToast('success', 'Video Approved', 'Moving to archive stage. Quality score recorded.');
      } else if (decision.includes('Flag') || decision.includes('Revision')) {
        showToast('warning', 'Flagged for Revision', 'Video returned to de-identification stage for re-processing.');
      } else if (decision.includes('Reject')) {
        showToast('error', 'Video Rejected', 'Video removed from pipeline. Original data preserved.');
      }
    });
  });

  // ── Form interactions ──
  document.querySelectorAll('select.form-select').forEach(function(sel) {
    sel.addEventListener('change', function() {
      var label = this.closest('.form-group') ?
        this.closest('.form-group').querySelector('.form-label') : null;
      var fieldName = label ? label.textContent.trim() : 'Setting';
      showToast('success', fieldName + ' Updated', 'Changed to: ' + this.options[this.selectedIndex].text);
    });
  });

  // ── Checkbox items with feedback ──
  document.querySelectorAll('.check-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var label = this.querySelector('.check-item-label');
      var cb = this.querySelector('input[type="checkbox"]');
      if (label && cb) {
        var name = label.textContent.trim();
        if (cb.checked) {
          showToast('info', 'Selected', name + ' added to configuration.');
        }
      }
    });
  });

  // ── Pipeline stage clicks ──
  document.querySelectorAll('.pipeline-stage').forEach(function(stage) {
    stage.style.cursor = 'pointer';
    stage.addEventListener('click', function() {
      var label = this.querySelector('.pipeline-stage-label');
      var count = this.querySelector('.pipeline-stage-count');
      if (label) {
        showToast('info', label.textContent.trim() + ' Stage',
          (count ? count.textContent.trim() : '') + ' videos in this stage.');
      }
    });
  });

  // ── Quick action cards ──
  document.querySelectorAll('.action-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var title = this.querySelector('.action-title, h3, strong');
      var name = title ? title.textContent.trim() : 'Action';
      showToast('info', name, 'Navigating to ' + name.toLowerCase() + ' workflow...');
    });
  });

  // ── Initial welcome toast on page load ──
  window.addEventListener('load', function() {
    var page = document.title || 'MaskingOPS';
    setTimeout(function() {
      showToast('info', 'Demo Mode Active',
        'This is a prototype of the ' + page.split(' - ')[0] + ' interface. ' +
        'Click any button to see simulated responses.');
    }, 1000);
  });

  // Make showToast globally available for custom page scripts
  window.demoToast = showToast;
  window.demoProgressToast = showProgressToast;

})();
