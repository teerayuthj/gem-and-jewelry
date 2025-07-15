class MapContactSection {
    constructor() {
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        const container = document.getElementById('mapContactSection');
        if (!container) return;

        container.innerHTML = `
            <div class="map-container" style="max-width: 1200px; margin: 0 auto;">
                <h2 style="text-align: center; margin-bottom: 5rem; color: #2c3e50; font-size: 3rem; font-weight: 600; font-family: 'Prompt', sans-serif;" 
                    data-i18n="contact.title">
                    เยี่ยมชมเรา
                </h2>
                
                <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: center; justify-content: center;">
                    <!-- Map Container -->
                    <div style="flex: 1; min-width: 300px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                        <div style="position: relative; padding-bottom: 60%;">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1937.9195656620043!2d100.5345192!3d13.7281875!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f2b54d9be83%3A0x569f8e5d59bad888!2sAusiris%20Company%20Limited!5e0!3m2!1sen!2sth!4v1749353588121!5m2!1sen!2sth" 
                                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>
                    </div>
                    
                    <!-- Contact Information -->
                    <div style="flex: 1; min-width: 300px; padding: 1.5rem; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                        <h3 style="color: #2c3e50; margin-bottom: 1.5rem; font-size: 2.5rem; font-weight: 600;" 
                            data-i18n="contact.companyName">
                            Ausiris Company Limited
                            <div style="font-size: 1.2rem; color: #7f8c8d; font-weight: 500; margin-top: 0.25rem;" 
                                 data-i18n="contact.companyNameEn">
                            AUSIRIS Co., Ltd (flagship store)
                            </div>
                        </h3>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <div style="display: flex; align-items: flex-start; margin-bottom: 1rem;">
                                <i class="fas fa-map-marker-alt" style="color: #e74c3c; font-size: 1.2rem; margin-right: 0.8rem; margin-top: 0.2rem;"></i>
                                <div>
                                    <p style="margin: 0; color: #34495e; line-height: 1.6; font-size: 1.5rem;">
                                        <span data-i18n="contact.address.line1">อาคารสีลม คอมเพล็กซ์ ชั้น 4</span><br>
                                        <span data-i18n="contact.address.line2">เลขที่ 191 Si Lom Rd, Si Lom,</span><br>
                                        <span data-i18n="contact.address.line3">Bang Rak, Bangkok 10500</span>
                                    </p>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                                <i class="fas fa-phone" style="color: #2ecc71; font-size: 1.2rem; margin-right: 0.8rem;"></i>
                                <a href="tel:+6621234567" style="color: #3498db; text-decoration: none; transition: color 0.3s ease; font-size: 1.5rem;" 
                                   data-i18n="contact.phone">
                                    02-613-4711-3 
                                </a>
                            </div>
                        </div>
                        
                        <a href="https://page.line.me/lgy9487c?openQrModal=true" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="display: inline-flex; align-items: center; background: #00c300; color: white; padding: 0.8rem 1rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.3s ease; font-size: 1.7rem; margin-top: 1rem;">
                            <i class="fab fa-line" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
                            <span data-i18n="contact.lineButton">ติดต่อผ่าน LINE</span>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MapContactSection();
});