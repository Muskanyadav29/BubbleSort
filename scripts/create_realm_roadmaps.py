import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

WIDTH = 768
HEIGHT = 1376

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

# ==============================================================================
# 1. GENERATE DESERT REALM ROADMAP (768 x 1376)
# ==============================================================================
def create_desert_roadmap():
    img = Image.new('RGB', (WIDTH, HEIGHT), (250, 180, 100))
    draw = ImageDraw.Draw(img)

    # Sky gradient: Warm glowing golden sunset fading into deep twilight at top
    sky = Image.new('RGB', (WIDTH, HEIGHT))
    sky_draw = ImageDraw.Draw(sky)
    for y in range(HEIGHT):
        t = y / HEIGHT
        if t < 0.25:
            # Twilight / Starry amber-violet
            p = t / 0.25
            r = int(180 * (1 - p) + 245 * p)
            g = int(90 * (1 - p) + 140 * p)
            b = int(120 * (1 - p) + 80 * p)
        elif t < 0.55:
            # Golden hour apricot to sun amber
            p = (t - 0.25) / 0.3
            r = int(245 * (1 - p) + 254 * p)
            g = int(140 * (1 - p) + 200 * p)
            b = int(80 * (1 - p) + 120 * p)
        else:
            # Lower desert warmth
            p = (t - 0.55) / 0.45
            r = int(254 * (1 - p) + 240 * p)
            g = int(200 * (1 - p) + 160 * p)
            b = int(120 * (1 - p) + 90 * p)
        sky_draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    img.paste(sky, (0, 0))

    # Sun glow in upper sky
    sun_overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    sun_draw = ImageDraw.Draw(sun_overlay)
    sun_cx, sun_cy = 384, 180
    for r in range(260, 0, -5):
        alpha = int(90 * (1 - r / 260)**1.5)
        sun_draw.ellipse([sun_cx - r, sun_cy - r, sun_cx + r, sun_cy + r], fill=(255, 240, 180, alpha))
    sun_draw.ellipse([sun_cx - 55, sun_cy - 55, sun_cx + 55, sun_cy + 55], fill=(255, 252, 220, 220))
    img.paste(sun_overlay, (0, 0), sun_overlay)

    # Distant Canyons & Sandstone Mesas (Upper Midground)
    mesa_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    mesa_draw = ImageDraw.Draw(mesa_layer)
    
    # Far horizon mesas
    far_points = [(0, 360)]
    for x in range(0, WIDTH + 20, 20):
        y = 330 + 40 * math.sin(x * 0.008) + 20 * math.cos(x * 0.02)
        far_points.append((x, y))
    far_points.extend([(WIDTH, 550), (0, 550)])
    mesa_draw.polygon(far_points, fill=(185, 95, 65, 180))

    # Midground plateau mesas with stepped strata
    mid_points = [(0, 440)]
    for x in range(0, WIDTH + 20, 15):
        y = 410 + 50 * math.sin(x * 0.012 + 1.2) + 25 * math.sin(x * 0.025)
        mid_points.append((x, y))
    mid_points.extend([(WIDTH, 650), (0, 650)])
    mesa_draw.polygon(mid_points, fill=(160, 75, 45, 220))

    # Strata lines on midground mesas
    for sy in range(430, 550, 16):
        mesa_draw.line([(0, sy), (WIDTH, sy + 15)], fill=(135, 60, 35, 120), width=3)

    img.paste(mesa_layer, (0, 0), mesa_layer)

    # Sand Dunes Landscape (Lower 60% of the canvas)
    dune_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    dune_draw = ImageDraw.Draw(dune_layer)

    # Dune Wave 1 (Upper desert)
    pts1 = [(-20, 560)]
    for x in range(-20, WIDTH + 30, 10):
        y = 540 + 70 * math.sin(x * 0.007 + 0.5)
        pts1.append((x, y))
    pts1.extend([(WIDTH + 20, 1380), (-20, 1380)])
    dune_draw.polygon(pts1, fill=(215, 135, 60, 255))

    # Dune Wave 2 (Mid desert)
    pts2 = [(-20, 720)]
    for x in range(-20, WIDTH + 30, 10):
        y = 700 + 80 * math.sin(x * 0.006 + 2.8)
        pts2.append((x, y))
    pts2.extend([(WIDTH + 20, 1380), (-20, 1380)])
    dune_draw.polygon(pts2, fill=(230, 155, 75, 255))

    # Dune Wave 3 (Lower mid)
    pts3 = [(-20, 910)]
    for x in range(-20, WIDTH + 30, 10):
        y = 890 + 90 * math.sin(x * 0.005 + 1.1)
        pts3.append((x, y))
    pts3.extend([(WIDTH + 20, 1380), (-20, 1380)])
    dune_draw.polygon(pts3, fill=(242, 175, 88, 255))

    # Dune Wave 4 (Foreground desert base)
    pts4 = [(-20, 1120)]
    for x in range(-20, WIDTH + 30, 10):
        y = 1100 + 75 * math.sin(x * 0.006 + 4.2)
        pts4.append((x, y))
    pts4.extend([(WIDTH + 20, 1380), (-20, 1380)])
    dune_draw.polygon(pts4, fill=(250, 190, 105, 255))

    # Oasis Pool at Bottom (Level 21 Oasis Base)
    dune_draw.ellipse([180, 1220, 588, 1340], fill=(45, 140, 195, 230), outline=(130, 215, 245, 255), width=4)
    dune_draw.ellipse([230, 1240, 538, 1320], fill=(56, 189, 248, 240))
    dune_draw.ellipse([290, 1255, 478, 1305], fill=(125, 211, 252, 220))

    img.paste(dune_layer, (0, 0), dune_layer)

    # Render Desert Realm Features: Palm Trees around Oasis
    feature_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    feat_draw = ImageDraw.Draw(feature_layer)

    def draw_palm(x, y, scale=1.0):
        # Trunk
        trunk_pts = [
            (x, y), (x + 8*scale, y - 25*scale), 
            (x + 12*scale, y - 55*scale), (x + 5*scale, y - 85*scale)
        ]
        feat_draw.line(trunk_pts, fill=(120, 60, 25, 255), width=int(8*scale))
        # Rings on trunk
        top_x, top_y = x + 5*scale, y - 85*scale
        # Fronds
        frond_angles = [-160, -125, -90, -55, -20, 15, 190]
        for a in frond_angles:
            rad = math.radians(a)
            tip_x = top_x + 55 * scale * math.cos(rad)
            tip_y = top_y + 40 * scale * math.sin(rad) + 12*scale
            ctrl_x = top_x + 35 * scale * math.cos(rad)
            ctrl_y = top_y + 30 * scale * math.sin(rad) - 15*scale
            feat_draw.line([(top_x, top_y), (ctrl_x, ctrl_y), (tip_x, tip_y)], fill=(34, 139, 34, 255), width=int(5*scale))
            feat_draw.line([(top_x, top_y), (ctrl_x, ctrl_y), (tip_x, tip_y)], fill=(74, 222, 128, 200), width=int(2.5*scale))

    draw_palm(170, 1230, 1.1)
    draw_palm(220, 1210, 0.85)
    draw_palm(550, 1220, 1.05)
    draw_palm(600, 1235, 0.8)

    # Desert Cacti scattered on dunes
    def draw_cactus(x, y, h=40):
        feat_draw.line([(x, y), (x, y - h)], fill=(46, 125, 50, 255), width=8)
        # Left arm
        feat_draw.line([(x, y - h*0.5), (x - 14, y - h*0.5), (x - 14, y - h*0.8)], fill=(46, 125, 50, 255), width=5)
        # Right arm
        feat_draw.line([(x, y - h*0.65), (x + 14, y - h*0.65), (x + 14, y - h*0.95)], fill=(46, 125, 50, 255), width=5)

    draw_cactus(110, 830, 48)
    draw_cactus(660, 770, 42)
    draw_cactus(130, 1050, 52)
    draw_cactus(640, 990, 46)

    # Sandstone Arch on right cliff (Level 34 area)
    feat_draw.arc([520, 480, 710, 680], start=180, end=360, fill=(155, 75, 40, 255), width=28)

    img.paste(feature_layer, (0, 0), feature_layer)

    # ==========================================================================
    # Winding Golden Sandstone Cobblestone Road (Levels 21 to 40)
    # Aligned precisely with DESERT_REALM_NODES:
    # 21: (50, 93) -> 25: (54, 77) -> 30: (32, 56) -> 35: (58, 35) -> 40: (50, 10)
    # ==========================================================================
    road_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    road_draw = ImageDraw.Draw(road_layer)

    desert_nodes = [
        (384, 1280), # L21
        (322, 1225), # L22
        (276, 1170), # L23
        (338, 1115), # L24
        (415, 1060), # L25
        (476, 1004), # L26
        (430, 949),  # L27
        (353, 894),  # L28
        (292, 839),  # L29
        (246, 771),  # L30 Sand Canyon
        (307, 716),  # L31
        (384, 660),  # L32
        (461, 605),  # L33
        (499, 537),  # L34
        (445, 482),  # L35 Obelisk
        (369, 427),  # L36
        (322, 358),  # L37
        (369, 289),  # L38
        (430, 220),  # L39
        (384, 138)   # L40 Pyramid Apex
    ]

    # Generate smooth road centerline using Catmull-Rom spline
    spline_points = []
    for i in range(len(desert_nodes) - 1):
        p0 = desert_nodes[max(0, i - 1)]
        p1 = desert_nodes[i]
        p2 = desert_nodes[i + 1]
        p3 = desert_nodes[min(len(desert_nodes) - 1, i + 2)]
        for step in range(20):
            t = step / 20.0
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            spline_points.append((x, y))
    spline_points.append(desert_nodes[-1])

    # 1. Road drop shadow
    shadow_pts = [(x + 4, y + 8) for (x, y) in spline_points]
    road_draw.line(shadow_pts, fill=(90, 45, 20, 110), width=58)

    # 2. Road sandstone border curb
    road_draw.line(spline_points, fill=(180, 110, 45, 255), width=52)
    # 3. Golden pavement surface
    road_draw.line(spline_points, fill=(245, 210, 125, 255), width=44)
    # 4. Subtle inner tile pattern
    road_draw.line(spline_points, fill=(225, 180, 95, 255), width=36)
    road_draw.line(spline_points, fill=(255, 235, 165, 200), width=6)

    img.paste(road_layer, (0, 0), road_layer)

    # ==========================================================================
    # Summit Landmark: The Great Sun Pyramid Palace (Level 40)
    # ==========================================================================
    pyramid_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(pyramid_layer)
    
    px, py = 384, 150
    # Shadowed right facet
    p_draw.polygon([(px, py - 95), (px + 140, py + 45), (px, py + 55)], fill=(175, 105, 30, 255))
    # Sunlit left facet
    p_draw.polygon([(px, py - 95), (px - 140, py + 45), (px, py + 55)], fill=(245, 195, 65, 255))
    # Stepped tiers / courses of stone
    for tier in range(1, 6):
        ty = py - 95 + tier * 24
        t_w_l = tier * 24
        t_w_r = tier * 24
        p_draw.line([(px - t_w_l, ty), (px, ty + 10)], fill=(255, 230, 120, 180), width=2)
        p_draw.line([(px, ty + 10), (px + t_w_r, ty)], fill=(130, 75, 20, 180), width=2)

    # Grand Pyramid Entrance Portal
    p_draw.polygon([(px - 26, py + 52), (px + 26, py + 52), (px + 20, py + 12), (px - 20, py + 12)], fill=(140, 75, 25, 255))
    p_draw.rectangle([px - 12, py + 18, px + 12, py + 52], fill=(20, 10, 5, 255))
    # Glowing hieroglyphs
    p_draw.ellipse([px - 6, py + 26, px + 6, py + 38], outline=(56, 189, 248, 255), width=2)

    # Golden Apex Capstone (Glowing Sun Relic)
    p_draw.polygon([(px, py - 95), (px - 28, py - 68), (px + 28, py - 68)], fill=(255, 250, 180, 255), outline=(255, 255, 255, 255), width=2)
    # Capstone aura glow
    for gr in range(40, 5, -5):
        p_draw.ellipse([px - gr, py - 85 - gr, px + gr, py - 85 + gr], fill=(254, 240, 138, int(80 * (1 - gr/40))))
    p_draw.ellipse([px - 14, py - 85 - 14, px + 14, py - 85 + 14], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)

    # Two Guardian Obelisks flanking pyramid
    for ox in [px - 165, px + 165]:
        p_draw.polygon([(ox - 10, py + 45), (ox + 10, py + 45), (ox + 6, py - 25), (ox - 6, py - 25)], fill=(215, 155, 55, 255))
        p_draw.polygon([(ox - 6, py - 25), (ox + 6, py - 25), (ox, py - 40)], fill=(255, 240, 150, 255))
        # Blue glowing rune on obelisk
        p_draw.line([(ox, py - 15), (ox, py + 25)], fill=(56, 189, 248, 230), width=3)

    img.paste(pyramid_layer, (0, 0), pyramid_layer)

    # Final polish: warm desert vignette & gentle contrast
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.15)
    return img


# ==============================================================================
# 2. GENERATE FROST PEAKS ROADMAP (768 x 1376)
# ==============================================================================
def create_frost_roadmap():
    img = Image.new('RGB', (WIDTH, HEIGHT), (10, 25, 55))

    # Night Polar Sky with deep midnight navy & cyan atmosphere
    sky = Image.new('RGB', (WIDTH, HEIGHT))
    sky_draw = ImageDraw.Draw(sky)
    for y in range(HEIGHT):
        t = y / HEIGHT
        if t < 0.35:
            # Deep arctic midnight space
            p = t / 0.35
            r = int(4 * (1 - p) + 10 * p)
            g = int(8 * (1 - p) + 35 * p)
            b = int(25 * (1 - p) + 75 * p)
        elif t < 0.7:
            # Glowing arctic mist & ice reflection
            p = (t - 0.35) / 0.35
            r = int(10 * (1 - p) + 15 * p)
            g = int(35 * (1 - p) + 75 * p)
            b = int(75 * (1 - p) + 130 * p)
        else:
            # Glacial ice floor reflection
            p = (t - 0.7) / 0.3
            r = int(15 * (1 - p) + 25 * p)
            g = int(75 * (1 - p) + 115 * p)
            b = int(130 * (1 - p) + 175 * p)
        sky_draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

    img.paste(sky, (0, 0))

    # Spectacular Glowing Aurora Borealis Curtains in the Sky
    aurora = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    aurora_draw = ImageDraw.Draw(aurora)
    
    # Ribbon 1: Radiant Emerald Green
    for x in range(0, WIDTH, 4):
        wave_y = 170 + 70 * math.sin(x * 0.009 + 0.4) + 30 * math.sin(x * 0.02)
        for h in range(130):
            alpha = int(95 * math.sin((h / 130) * math.pi))
            aurora_draw.line([(x, wave_y - h), (x, wave_y - h + 4)], fill=(52, 211, 153, alpha), width=4)

    # Ribbon 2: Electric Cyan / Turquoise
    for x in range(0, WIDTH, 4):
        wave_y = 230 + 80 * math.sin(x * 0.007 + 2.1) + 25 * math.cos(x * 0.015)
        for h in range(150):
            alpha = int(110 * math.sin((h / 150) * math.pi))
            aurora_draw.line([(x, wave_y - h), (x, wave_y - h + 4)], fill=(56, 189, 248, alpha), width=4)

    # Ribbon 3: Mystical Violet-Magenta highlights
    for x in range(0, WIDTH, 4):
        wave_y = 140 + 60 * math.sin(x * 0.01 + 3.8)
        for h in range(90):
            alpha = int(70 * math.sin((h / 90) * math.pi))
            aurora_draw.line([(x, wave_y - h), (x, wave_y - h + 4)], fill=(192, 132, 252, alpha), width=4)

    # Soften aurora
    aurora = aurora.filter(ImageFilter.GaussianBlur(radius=8))
    img.paste(aurora, (0, 0), aurora)

    # Distant Jagged Snow Mountain Peaks
    mtn_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    mtn_draw = ImageDraw.Draw(mtn_layer)

    # Mountain silhouette background
    far_peaks = [(0, 420)]
    for x in range(0, WIDTH + 20, 20):
        y = 350 + 90 * math.sin(x * 0.015) + 40 * math.sin(x * 0.04 + 1.0)
        far_peaks.append((x, y))
    far_peaks.extend([(WIDTH, 650), (0, 650)])
    mtn_draw.polygon(far_peaks, fill=(15, 45, 80, 210))

    # Midground Glacial Mountains with Snow Facets
    mid_peaks = [(0, 520)]
    for x in range(0, WIDTH + 15, 15):
        y = 440 + 85 * math.sin(x * 0.012 + 2.5) + 30 * math.cos(x * 0.03)
        mid_peaks.append((x, y))
    mid_peaks.extend([(WIDTH, 750), (0, 750)])
    mtn_draw.polygon(mid_peaks, fill=(30, 80, 135, 240))

    # Snow caps on mid peaks
    for x in range(20, WIDTH - 20, 45):
        sy = 440 + 85 * math.sin(x * 0.012 + 2.5) + 30 * math.cos(x * 0.03)
        mtn_draw.polygon([(x - 22, sy + 38), (x, sy), (x + 22, sy + 38)], fill=(240, 249, 255, 230))

    img.paste(mtn_layer, (0, 0), mtn_layer)

    # Glaciers, Snowfields & Frozen Waterfalls (Lower 60%)
    snow_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(snow_layer)

    # Snow Shelf 1
    p1 = [(-20, 580)]
    for x in range(-20, WIDTH + 30, 12):
        y = 560 + 65 * math.sin(x * 0.007 + 0.8)
        p1.append((x, y))
    p1.extend([(WIDTH + 20, 1380), (-20, 1380)])
    s_draw.polygon(p1, fill=(70, 130, 185, 255))

    # Snow Shelf 2 (Pure Glacial Ice White-Blue)
    p2 = [(-20, 740)]
    for x in range(-20, WIDTH + 30, 12):
        y = 720 + 75 * math.sin(x * 0.006 + 3.2)
        p2.append((x, y))
    p2.extend([(WIDTH + 20, 1380), (-20, 1380)])
    s_draw.polygon(p2, fill=(140, 195, 235, 255))

    # Snow Shelf 3 (Lower Ice Plain)
    p3 = [(-20, 930)]
    for x in range(-20, WIDTH + 30, 12):
        y = 910 + 85 * math.sin(x * 0.005 + 1.5)
        p3.append((x, y))
    p3.extend([(WIDTH + 20, 1380), (-20, 1380)])
    s_draw.polygon(p3, fill=(186, 230, 253, 255))

    # Snow Shelf 4 (Foreground Frozen Lake Shore)
    p4 = [(-20, 1140)]
    for x in range(-20, WIDTH + 30, 12):
        y = 1120 + 70 * math.sin(x * 0.006 + 4.5)
        p4.append((x, y))
    p4.extend([(WIDTH + 20, 1380), (-20, 1380)])
    s_draw.polygon(p4, fill=(224, 242, 254, 255))

    # Frozen Glacial Lake at Bottom (Level 41 Frozen Lake)
    s_draw.ellipse([160, 1210, 608, 1350], fill=(2, 132, 199, 230), outline=(186, 230, 253, 255), width=5)
    s_draw.ellipse([210, 1230, 558, 1330], fill=(56, 189, 248, 220))
    # Cracks in the frozen lake ice
    s_draw.line([(260, 1270), (330, 1285), (380, 1275), (460, 1290)], fill=(255, 255, 255, 200), width=2)
    s_draw.line([(330, 1285), (345, 1315)], fill=(255, 255, 255, 180), width=1)

    img.paste(snow_layer, (0, 0), snow_layer)

    # Frost Elements: Snow Pine Trees & Ice Crystals
    forest_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(forest_layer)

    def draw_pine(x, y, h=50):
        # Trunk
        f_draw.line([(x, y), (x, y - h*0.3)], fill=(40, 25, 20, 255), width=4)
        # 3 Tiers of snowy pine branches
        for i in range(3):
            tier_y = y - h * 0.25 - i * (h * 0.28)
            tier_w = (h * 0.45) * (1.0 - i * 0.22)
            # Dark pine foliage
            f_draw.polygon([(x - tier_w, tier_y + 12), (x, tier_y - 12), (x + tier_w, tier_y + 12)], fill=(15, 60, 65, 255))
            # Snow cap on branches
            f_draw.polygon([(x - tier_w, tier_y + 12), (x, tier_y - 12), (x + tier_w, tier_y + 12)], fill=(240, 249, 255, 200))

    # Forest clusters
    draw_pine(120, 840, 55)
    draw_pine(155, 855, 45)
    draw_pine(650, 780, 52)
    draw_pine(620, 795, 42)
    draw_pine(130, 1070, 58)
    draw_pine(630, 1010, 50)
    draw_pine(595, 1025, 42)

    # Giant Frozen Ice Crystals sticking out of snow
    def draw_ice_crystal(x, y, h=45, w=14):
        # Facets
        f_draw.polygon([(x, y - h), (x - w, y - h*0.4), (x, y), (x + w, y - h*0.4)], fill=(125, 211, 252, 230), outline=(255, 255, 255, 240), width=2)
        f_draw.polygon([(x, y - h), (x, y), (x + w, y - h*0.4)], fill=(56, 189, 248, 240))

    draw_ice_crystal(210, 710, 55, 16)
    draw_ice_crystal(230, 725, 38, 12)
    draw_ice_crystal(570, 620, 50, 15)
    draw_ice_crystal(590, 635, 35, 10)

    img.paste(forest_layer, (0, 0), forest_layer)

    # ==========================================================================
    # Winding Glacial Ice Road (Levels 41 to 60)
    # Aligned precisely with FROST_PEAKS_NODES:
    # 41: (52, 93) -> 45: (48, 77) -> 50: (62, 56) -> 55: (34, 35) -> 60: (50, 10)
    # ==========================================================================
    road_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    road_draw = ImageDraw.Draw(road_layer)

    frost_nodes = [
        (399, 1280), # L41 Frozen Lake
        (460, 1225), # L42
        (506, 1170), # L43
        (445, 1115), # L44
        (368, 1060), # L45
        (291, 1004), # L46
        (261, 949),  # L47
        (322, 894),  # L48
        (399, 839),  # L49
        (476, 771),  # L50 Glacier Bridge
        (506, 716),  # L51
        (445, 660),  # L52
        (368, 605),  # L53
        (291, 550),  # L54
        (261, 482),  # L55 Crystal Cavern
        (322, 427),  # L56
        (399, 358),  # L57
        (460, 289),  # L58
        (430, 220),  # L59
        (384, 138)   # L60 Ice Citadel
    ]

    spline_points = []
    for i in range(len(frost_nodes) - 1):
        p0 = frost_nodes[max(0, i - 1)]
        p1 = frost_nodes[i]
        p2 = frost_nodes[i + 1]
        p3 = frost_nodes[min(len(frost_nodes) - 1, i + 2)]
        for step in range(20):
            t = step / 20.0
            t2 = t * t
            t3 = t2 * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            spline_points.append((x, y))
    spline_points.append(frost_nodes[-1])

    # 1. Ice road drop shadow (deep sapphire glow)
    shadow_pts = [(x + 3, y + 7) for (x, y) in spline_points]
    road_draw.line(shadow_pts, fill=(10, 30, 70, 140), width=58)

    # 2. Frozen ice stone border curb
    road_draw.line(spline_points, fill=(56, 189, 248, 255), width=52)
    # 3. Glistening glacier ice pathway
    road_draw.line(spline_points, fill=(240, 249, 255, 255), width=44)
    # 4. Translucent ice cyan core
    road_draw.line(spline_points, fill=(186, 230, 253, 230), width=36)
    # 5. Glowing white central skate track
    road_draw.line(spline_points, fill=(255, 255, 255, 240), width=6)

    img.paste(road_layer, (0, 0), road_layer)

    # ==========================================================================
    # Summit Landmark: Ice Crystal Citadel Palace (Level 60)
    # ==========================================================================
    citadel_layer = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(citadel_layer)

    cx, cy = 384, 150
    # Central Grand Ice Tower
    c_draw.polygon([(cx - 35, cy + 50), (cx + 35, cy + 50), (cx + 25, cy - 40), (cx - 25, cy - 40)], fill=(125, 211, 252, 255), outline=(255, 255, 255, 255), width=2)
    # Glowing Central Ice Spire
    c_draw.polygon([(cx - 25, cy - 40), (cx + 25, cy - 40), (cx, cy - 105)], fill=(224, 242, 254, 255), outline=(255, 255, 255, 255), width=2)

    # Left & Right Flanking Turrets
    for tx, sp_h in [(cx - 65, 80), (cx + 65, 80)]:
        c_draw.polygon([(tx - 20, cy + 50), (tx + 20, cy + 50), (tx + 15, cy - 20), (tx - 15, cy - 20)], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)
        c_draw.polygon([(tx - 15, cy - 20), (tx + 15, cy - 20), (tx, cy - sp_h)], fill=(186, 230, 253, 255), outline=(255, 255, 255, 255), width=2)

    # Glowing Crystal Heart at apex
    for gr in range(45, 5, -5):
        c_draw.ellipse([cx - gr, cy - 95 - gr, cx + gr, cy - 95 + gr], fill=(56, 189, 248, int(85 * (1 - gr/45))))
    c_draw.ellipse([cx - 15, cy - 95 - 15, cx + 15, cy - 95 + 15], fill=(255, 255, 255, 255), outline=(125, 211, 252, 255), width=2)

    # Ice Palace Entrance Archway
    c_draw.arc([cx - 16, cy + 18, cx + 16, cy + 50], start=180, end=360, fill=(3, 105, 161, 255), width=18)

    img.paste(citadel_layer, (0, 0), citadel_layer)

    # Final polish: Cold crystal brilliance
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(1.2)
    return img


# ==============================================================================
# 3. GENERATE FROST PEAKS THUMBNAIL (1024 x 1024)
# ==============================================================================
def create_frost_thumb():
    size = 1024
    img = Image.new('RGB', (size, size), (11, 12, 16))
    draw = ImageDraw.Draw(img)

    # Dark background glow
    for r in range(400, 100, -20):
        alpha = int(45 * (1 - r / 400))
        draw.ellipse([512 - r, 512 - r, 512 + r, 512 + r], fill=(2, 132, 199, alpha))

    # Floating Ice Mountain Pedestal Island
    cx, cy = 512, 540
    # Floating Rock Island Base
    base_pts = [
        (cx - 280, cy), (cx, cy + 120), (cx + 280, cy),
        (cx + 180, cy + 220), (cx, cy + 320), (cx - 180, cy + 220)
    ]
    draw.polygon(base_pts, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=4)

    # Island Top Glacial Surface
    ice_top = [
        (cx - 280, cy), (cx, cy - 140), (cx + 280, cy), (cx, cy + 120)
    ]
    draw.polygon(ice_top, fill=(186, 230, 253, 255), outline=(255, 255, 255, 255), width=3)

    # Ice Crystal Castle Citadel in center
    draw.polygon([(cx - 70, cy - 60), (cx + 70, cy - 60), (cx + 50, cy - 240), (cx - 50, cy - 240)], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=3)
    draw.polygon([(cx - 50, cy - 240), (cx + 50, cy - 240), (cx, cy - 350)], fill=(224, 242, 254, 255), outline=(255, 255, 255, 255), width=3)

    # Flanking Spire Left & Right
    draw.polygon([(cx - 130, cy - 40), (cx - 70, cy - 40), (cx - 100, cy - 260)], fill=(125, 211, 252, 255), outline=(255, 255, 255, 255), width=2)
    draw.polygon([(cx + 70, cy - 40), (cx + 130, cy - 40), (cx + 100, cy - 260)], fill=(125, 211, 252, 255), outline=(255, 255, 255, 255), width=2)

    # Floating glowing ice crystal shards around island
    shards = [
        (cx - 240, cy - 160, 40), (cx + 250, cy - 140, 45),
        (cx - 290, cy + 110, 35), (cx + 280, cy + 130, 38)
    ]
    for sx, sy, sh in shards:
        draw.polygon([(sx, sy - sh), (sx - 12, sy), (sx, sy + sh*0.5), (sx + 12, sy)], fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)

    return img


if __name__ == '__main__':
    print('Generating Desert Realm Roadmap...')
    desert_img = create_desert_roadmap()
    desert_img.save('client/public/assets/desert_realm_roadmap.jpg', quality=95)
    print('Desert Realm Roadmap saved!')

    print('Generating Frost Peaks Roadmap...')
    frost_img = create_frost_roadmap()
    frost_img.save('client/public/assets/frost_peaks_roadmap.jpg', quality=95)
    print('Frost Peaks Roadmap saved!')

    print('Generating Frost Peaks Thumbnail...')
    frost_thumb = create_frost_thumb()
    frost_thumb.save('client/public/assets/frost_peaks_thumb.jpg', quality=95)
    print('Frost Peaks Thumbnail saved!')
