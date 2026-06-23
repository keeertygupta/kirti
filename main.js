document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Initial check

  // --- Mobile Navigation Toggle ---
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // --- Scroll-triggered Animations (Intersection Observer) ---
  const animateElements = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && animateElements.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.15
    };

    const animationObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Animates only once
        }
      });
    }, observerOptions);

    animateElements.forEach(element => {
      animationObserver.observe(element);
    });
  } else {
    // Fallback if observer not supported
    animateElements.forEach(element => {
      element.classList.add('visible');
    });
  }

  // --- FAQ Accordion logic ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Close all other FAQs
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current FAQ
        if (isOpen) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });

  // --- Admissions Fee Calculator ---
  const feeGradeSelect = document.getElementById('calc-grade');
  const serviceCheckboxes = document.querySelectorAll('.calc-service');
  const baseFeeEl = document.getElementById('base-fee-val');
  const servicesFeeEl = document.getElementById('services-fee-val');
  const totalFeeEl = document.getElementById('total-fee-val');

  if (feeGradeSelect) {
    const baseFees = {
      elementary: 12000,
      middle: 14500,
      high: 17000
    };

    const updateCalculator = () => {
      const selectedGrade = feeGradeSelect.value;
      const baseFee = baseFees[selectedGrade] || 0;
      
      let servicesFee = 0;
      serviceCheckboxes.forEach(cb => {
        if (cb.checked) {
          servicesFee += parseFloat(cb.getAttribute('data-cost')) || 0;
        }
      });

      const totalFee = baseFee + servicesFee;

      // Animate/Update values
      animateValue(baseFeeEl, baseFee);
      animateValue(servicesFeeEl, servicesFee);
      animateValue(totalFeeEl, totalFee);
    };

    // Helper function for counter animation
    function animateValue(obj, targetValue) {
      if (!obj) return;
      let startTimestamp = null;
      const startValue = parseInt(obj.innerText.replace(/[^0-9]/g, '')) || 0;
      const duration = 400; // ms

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (targetValue - startValue) + startValue);
        obj.innerText = `$${currentVal.toLocaleString()}`;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          obj.innerText = `$${targetValue.toLocaleString()}`;
        }
      };
      window.requestAnimationFrame(step);
    }

    // Attach listeners
    feeGradeSelect.addEventListener('change', updateCalculator);
    serviceCheckboxes.forEach(cb => cb.addEventListener('change', updateCalculator));

    // Initial run to show defaults
    updateCalculator();
  }

  // --- Tab Switcher (Academics Page) ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const activateTab = (targetTab) => {
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
    const activePanel = document.getElementById(`panel-${targetTab}`);

    if (activeBtn && activePanel) {
      activeBtn.classList.add('active');
      activePanel.classList.add('active');
    }
  };

  if (tabButtons.length > 0 && tabPanels.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        activateTab(targetTab);
      });
    });

    // Deep-link support: academics.html#elementary, #middle, #high
    const tierHashes = ['elementary', 'middle', 'high'];
    const handleHashNavigation = () => {
      const hash = window.location.hash.replace('#', '');
      if (tierHashes.includes(hash)) {
        activateTab(hash);
        const curriculumSection = document.getElementById('curriculum-tiers');
        if (curriculumSection) {
          setTimeout(() => {
            curriculumSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    handleHashNavigation();
    window.addEventListener('hashchange', handleHashNavigation);
  }

  // --- Newsletter Forms ---
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value.trim()) {
        alert('Thank you for subscribing! You will receive our next newsletter at ' + emailInput.value.trim());
        form.reset();
      }
    });
  });

  // --- Testimonial Slider ---
  const testimonials = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.slider-dot');
  let currentSlide = 0;
  let autoPlayInterval = null;

  if (testimonials.length > 0 && dots.length > 0) {
    const showSlide = (n) => {
      testimonials.forEach(t => t.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      
      currentSlide = (n + testimonials.length) % testimonials.length;
      testimonials[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
    };

    const nextSlide = () => {
      showSlide(currentSlide + 1);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        resetAutoPlay();
      });
    });

    const startAutoPlay = () => {
      autoPlayInterval = setInterval(nextSlide, 6000);
    };

    const resetAutoPlay = () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        startAutoPlay();
      }
    };

    // Initialize
    showSlide(0);
    startAutoPlay();
  }

  // --- Pay Online Module ---
  const mockStudents = {
    "APEX-101": { name: "Alice Jenkins", grade: "High School (Junior)", base: 17000, addOn: 2500, total: 19500 },
    "APEX-102": { name: "Marcus Lee Jr.", grade: "Elementary (Grade 4)", base: 12000, addOn: 1200, total: 13200 },
    "APEX-103": { name: "Elena Rostova", grade: "High School (Senior)", base: 17000, addOn: 800, total: 17800 },
    "APEX-104": { name: "Ethan Carter", grade: "Middle School (Grade 7)", base: 14500, addOn: 0, total: 14500 }
  };

  const lookupForm = document.getElementById('fee-lookup-form');
  const studentIdInput = document.getElementById('student-id-input');
  const lookupError = document.getElementById('lookup-error');
  
  const invoicePanel = document.getElementById('invoice-panel');
  const invoiceStudentName = document.getElementById('invoice-student-name');
  const invoiceGrade = document.getElementById('invoice-grade');
  const invoiceBase = document.getElementById('invoice-base-val');
  const invoiceAddons = document.getElementById('invoice-addons-val');
  const invoiceTotal = document.getElementById('invoice-total-val');
  
  const paymentPanel = document.getElementById('payment-panel');
  const paymentAmountInput = document.getElementById('payment-amount-input');
  const checkoutForm = document.getElementById('payment-checkout-form');
  
  const cardPreview = document.querySelector('.card-preview');
  const cardNumberInput = document.getElementById('card-number-input');
  const cardNameInput = document.getElementById('card-name-input');
  const cardExpiryInput = document.getElementById('card-expiry-input');
  const cardCvvInput = document.getElementById('card-cvv-input');
  
  const cardNumDisplay = document.querySelector('.card-number-display');
  const cardNameDisplay = document.querySelector('.card-name-display');
  const cardExpiryDisplay = document.querySelector('.card-expiry-display');
  const cardCvvDisplay = document.querySelector('.card-cvv-display');
  
  const successOverlay = document.querySelector('.success-overlay');
  const closeSuccessBtn = document.getElementById('close-success-btn');

  // Student Lookup Action
  if (lookupForm) {
    lookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = studentIdInput.value.trim().toUpperCase();
      
      if (mockStudents[id]) {
        // Match found!
        lookupError.style.display = 'none';
        
        invoiceStudentName.innerText = mockStudents[id].name;
        invoiceGrade.innerText = mockStudents[id].grade;
        invoiceBase.innerText = `$${mockStudents[id].base.toLocaleString()}`;
        invoiceAddons.innerText = `$${mockStudents[id].addOn.toLocaleString()}`;
        invoiceTotal.innerText = `$${mockStudents[id].total.toLocaleString()}`;
        
        if (paymentAmountInput) {
          paymentAmountInput.value = mockStudents[id].total;
        }
        
        invoicePanel.style.display = 'block';
        if (paymentPanel) paymentPanel.style.display = 'block';
        
        // Scroll to invoice details
        invoicePanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // No match
        lookupError.style.display = 'block';
        invoicePanel.style.display = 'none';
        if (paymentPanel) paymentPanel.style.display = 'none';
      }
    });
  }

  // Credit Card Live Mirroring
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }
      e.target.value = formatted.substring(0, 19); // limit to 16 digits + 3 spaces
      
      let mirror = e.target.value;
      // Pad remaining with dots
      const padLength = 19 - mirror.length;
      for (let i = 0; i < padLength; i++) {
        let charIndex = mirror.length;
        if (charIndex === 4 || charIndex === 9 || charIndex === 14) {
          mirror += ' ';
        } else {
          mirror += '•';
        }
      }
      cardNumDisplay.innerText = mirror;
    });
  }

  if (cardNameInput) {
    cardNameInput.addEventListener('input', (e) => {
      let val = e.target.value.toUpperCase();
      cardNameDisplay.innerText = val || "CARDHOLDER NAME";
    });
  }

  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (val.length >= 2) {
        val = val.substring(0, 2) + '/' + val.substring(2, 4);
      }
      e.target.value = val.substring(0, 5); // MM/YY
      
      cardExpiryDisplay.innerText = e.target.value || "MM/YY";
    });
  }

  if (cardCvvInput) {
    cardCvvInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = val.substring(0, 3);
      cardCvvDisplay.innerText = "•".repeat(e.target.value.length) || "•••";
    });

    // Flip card when focusing CVV
    cardCvvInput.addEventListener('focus', () => {
      if (cardPreview) cardPreview.classList.add('flipped');
    });

    cardCvvInput.addEventListener('blur', () => {
      if (cardPreview) cardPreview.classList.remove('flipped');
    });
  }

  // Checkout submission simulation
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const payBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = payBtn.innerText;
      
      payBtn.disabled = true;
      payBtn.innerText = "Processing secure transaction...";
      
      // Simulate network wait
      setTimeout(() => {
        payBtn.disabled = false;
        payBtn.innerText = originalText;
        
        // Show success modal
        if (successOverlay) successOverlay.style.display = 'flex';
      }, 2000);
    });
  }

  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      if (successOverlay) successOverlay.style.display = 'none';
      if (checkoutForm) checkoutForm.reset();
      if (lookupForm) lookupForm.reset();
      if (invoicePanel) invoicePanel.style.display = 'none';
      if (paymentPanel) paymentPanel.style.display = 'none';
      
      // reset card visual values
      if (cardNumDisplay) cardNumDisplay.innerText = "•••• •••• •••• ••••";
      if (cardNameDisplay) cardNameDisplay.innerText = "CARDHOLDER NAME";
      if (cardExpiryDisplay) cardExpiryDisplay.innerText = "MM/YY";
      if (cardCvvDisplay) cardCvvDisplay.innerText = "•••";
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

