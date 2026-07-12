import i18n from '../localization/translation.js';

const checkCpuGpuRelationship = (targetCpu, targetGpu, errors, warnings) => {
    if (!targetCpu || !targetGpu) {
        if (targetCpu && !targetCpu.has_apu && !targetGpu) {
            warnings.push(i18n.t('compat_warn_no_gpu'));
        }
        return;
    }

    const activeCpuClock = targetCpu.boost_clock || targetCpu.core_clock || 3.0; 
    const activeGpuClock = targetGpu.boost_clock || targetGpu.core_clock || 1500; 
    const cpuScore = targetCpu.core_count * activeCpuClock;
    const gpuScore = targetGpu.memory * (activeGpuClock / 1000);
    const ratio = cpuScore / gpuScore;

    if (ratio < 0.45) warnings.push(i18n.t('compat_err_cpu_weak'));
    else if (ratio < 0.7) warnings.push(i18n.t('compat_warn_cpu_bottleneck'));
    else if (ratio > 4.0) warnings.push(i18n.t('compat_warn_gpu_bottleneck'));

    if (targetCpu.tdp + targetGpu.tdp > 450) {
        warnings.push(i18n.t('compat_warn_thermal_load'));
    }
};

export const checkCompatibility = (part, selections) => {
    const currentParts = Object.values(selections).filter(Boolean);
    
    const cpu = currentParts.find(p => p.category === "CPU");
    const cooler = currentParts.find(p => p.category === "CPUCooler");
    const mobo = currentParts.find(p => p.category === "Motherboard");
    const ram = currentParts.find(p => p.category === "Memory");
    const storage = currentParts.find(p => p.category === "Storage");
    const psu = currentParts.find(p => p.category === "PowerSupply");
    const gpu = currentParts.find(p => p.category === "VideoCard");
    const pcCase = currentParts.find(p => p.category === "Case");

    const errors = [];
    const warnings = [];

    if (part.category === "Motherboard") {
        if (cpu && part.socket !== cpu.socket) errors.push(i18n.t('compat_err_socket_mobo', { cpuSocket: cpu.socket, boardSocket: part.socket }));
        if (pcCase && !pcCase.supported_mobo_form_factors.includes(part.form_factor)) errors.push(i18n.t('compat_err_case_mobo', { formFactor: part.form_factor }));
        if (ram) {
            if (part.memory_gen !== ram.speed[0]) errors.push(i18n.t('compat_err_ram_gen_mobo', { boardGen: part.memory_gen, ramGen: ram.speed[0] }));
            if (part.memory_slots < ram.modules[0]) errors.push(i18n.t('compat_err_ram_slots_mobo', { boardSlots: part.memory_slots, ramSlots: ram.modules[0] }));
        }
        if (cooler && !cooler.supported_sockets.includes(part.socket)) errors.push(i18n.t('compat_err_cooler_mobo', { boardSocket: part.socket }));
    }

    if (part.category === "CPU") {
        if (mobo && part.socket !== mobo.socket) errors.push(i18n.t('compat_err_socket_cpu', { boardSocket: mobo.socket }));
        if (ram && !part.supported_memory.includes(ram.speed[0])) errors.push(i18n.t('compat_err_ram_cpu', { ramGen: ram.speed[0] }));
        if (cooler && !cooler.supported_sockets.includes(part.socket)) errors.push(i18n.t('compat_err_cooler_cpu', { cpuSocket: part.socket }));
        if (cooler && cooler.max_tdp_cooling < part.tdp) warnings.push(i18n.t('compat_warn_cooler_tdp', { coolerTdp: cooler.max_tdp_cooling, cpuTdp: part.tdp }));
        if (psu) {
            const gpuDraw = gpu ? gpu.tdp : 0;
            const currentDraw = part.tdp + gpuDraw + 100;
            if (psu.wattage < currentDraw) errors.push(i18n.t('compat_err_psu_cpu', { draw: currentDraw, psuWattage: psu.wattage }));
        }
        checkCpuGpuRelationship(part, gpu, errors, warnings);
    }

    if (part.category === "CPUCooler") {
        if (cpu) {
            if (!part.supported_sockets.includes(cpu.socket)) errors.push(i18n.t('compat_err_cooler_mount', { cpuSocket: cpu.socket }));
            if (part.max_tdp_cooling < cpu.tdp) warnings.push(i18n.t('compat_warn_cooler_tdp', { coolerTdp: part.max_tdp_cooling, cpuTdp: cpu.tdp }));
        }
        if (mobo && !part.supported_sockets.includes(mobo.socket)) errors.push(i18n.t('compat_err_cooler_mobo', { boardSocket: mobo.socket }));
        if (pcCase) {
            if (part.type === "Air" && part.height > pcCase.max_cpu_cooler_height) errors.push(i18n.t('compat_err_cooler_clearance', { partSize: part.height, caseClearance: pcCase.max_cpu_cooler_height }));
            if (part.type === "Liquid" && part.radiator_size > 0 && !pcCase.supported_radiators.includes(part.radiator_size)) errors.push(i18n.t('compat_err_liquid', { radSize: part.radiator_size }));
        }
    }

    if (part.category === "Memory") {
        if (mobo) {
            if (part.speed[0] !== mobo.memory_gen) errors.push(i18n.t('compat_err_ram_gen_mobo', { ramGen: part.speed[0], boardGen: mobo.memory_gen }));
            if (part.modules[0] > mobo.memory_slots) errors.push(i18n.t('compat_err_ram_slots_mobo', { ramSlots: part.modules[0], boardSlots: mobo.memory_slots }));
        }
        if (cpu && !cpu.supported_memory.includes(part.speed[0])) errors.push(i18n.t('compat_err_ram_gen_cpu', { ramGen: part.speed[0] }));
    }

    if (part.category === "VideoCard") {
        if (pcCase && part.length > pcCase.max_gpu_length) errors.push(i18n.t('compat_err_cooler_clearance', { partSize: part.length, caseClearance: pcCase.max_gpu_length }));
        if (psu) {
            const cpuDraw = cpu ? cpu.tdp : 0;
            const currentDraw = cpuDraw + part.tdp + 100;
            if (psu.wattage < currentDraw) errors.push(i18n.t('compat_err_psu_gpu', { draw: currentDraw, psuWattage: psu.wattage }));
            if (psu.wattage < part.recommended_psu_wattage) warnings.push(i18n.t('compat_warn_psu_gpu', { recWattage: part.recommended_psu_wattage, psuWattage: psu.wattage }));
        }
        checkCpuGpuRelationship(cpu, part, errors, warnings);
    }

    if (part.category === "Case") {
        if (mobo && !part.supported_mobo_form_factors.includes(mobo.form_factor)) errors.push(i18n.t('compat_err_case_mobo_block', { formFactor: mobo.form_factor }));
        if (gpu && part.max_gpu_length < gpu.length) errors.push(i18n.t('compat_err_cooler_clearance', { partSize: gpu.length, caseClearance: part.max_gpu_length }));
        if (cooler) {
            if (cooler.type === "Air" && part.max_cpu_cooler_height < cooler.height) errors.push(i18n.t('compat_err_cooler_clearance', { partSize: cooler.height, caseClearance: part.max_cpu_cooler_height }));
            if (cooler.type === "Liquid" && cooler.radiator_size > 0 && !part.supported_radiators.includes(cooler.radiator_size)) errors.push(i18n.t('compat_err_liquid', { radSize: cooler.radiator_size }));
        }
        if (psu && part.psu_form_factor !== psu.type) errors.push(i18n.t('compat_err_case_psu', { casePsu: part.psu_form_factor, psuType: psu.type }));
    }

    if (part.category === "PowerSupply") {
        if (pcCase && part.type !== pcCase.psu_form_factor) errors.push(i18n.t('compat_err_psu_case', { psuType: part.type, casePsu: pcCase.psu_form_factor }));
        
        let estimatedDraw = 100; 
        if (cpu) estimatedDraw += cpu.tdp;
        if (gpu) estimatedDraw += gpu.tdp;

        if ((cpu || gpu) && part.wattage < estimatedDraw) errors.push(i18n.t('compat_err_psu_insufficient', { draw: estimatedDraw, psuWattage: part.wattage }));
        if (gpu && part.wattage < gpu.recommended_psu_wattage) warnings.push(i18n.t('compat_warn_psu_low', { psuWattage: part.wattage, recWattage: gpu.recommended_psu_wattage }));
    }

    if (part.category === "Storage") {
        if (mobo && part.form_factor === "M.2 2280" && mobo.m2_slots === 0) errors.push(i18n.t('compat_err_storage_m2'));
    }

    const activeColors = [cpu, cooler, mobo, ram, gpu, pcCase, psu].filter(p => p && p.color).map(p => p.color);
    if (part.color && activeColors.length > 2) {
        const mismatchCount = activeColors.filter(c => c !== part.color).length;
        if (mismatchCount > 3) {
            warnings.push(i18n.t('compat_warn_style', { color: part.color }));
        }
    }

    if (errors.length > 0) return { isCompatible: false, isWarning: false, reason: errors.map(r => `• ${r}`).join('\n') };
    if (warnings.length > 0) return { isCompatible: true, isWarning: true, reason: warnings.map(r => `• ${r}`).join('\n') };
    return { isCompatible: true, isWarning: false, reason: null };
};