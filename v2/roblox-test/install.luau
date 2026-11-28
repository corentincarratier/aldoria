-- ALDORIA V2 : prototype Roblox Studio, réservé à une NOUVELLE Baseplate.
-- Coller le fichier entier dans la barre de commande en mode édition.
-- Aucun accès réseau, achat, publication, DataStore ni modification de la V1.
local RunService = game:GetService("RunService")
assert(not RunService:IsRunning(), "Arrête le test avant l'installation.")
local W = game:GetService("Workspace")
local SS = game:GetService("ServerScriptService")
local RS = game:GetService("ReplicatedStorage")
local SP = game:GetService("StarterPlayer")
local L = game:GetService("Lighting")
local editor = game:GetService("ScriptEditorService")
assert(game.PlaceId == 0, "Ouvre une nouvelle Baseplate NON publiée, pas un jeu existant.")
for _, child in ipairs(W:GetChildren()) do
	assert(child:IsA("Camera") or child:IsA("Terrain") or child.Name == "Baseplate" or (child.Name == "SpawnLocation" and child:IsA("SpawnLocation")), "Utilise uniquement une Baseplate neuve : " .. child.Name)
end
assert(not RS:FindFirstChild("AldoriaV2Remote") and not SS:FindFirstChild("AldoriaV2Server") and not SP.StarterPlayerScripts:FindFirstChild("AldoriaV2Client"), "Un prototype existe déjà.")
local root = Instance.new("Folder", W)
root.Name = "AldoriaV2"
local function folder(name)
	local f = Instance.new("Folder", root); f.Name = name; return f
end
local world, trees, mobs, fx = folder("World"), folder("Trees"), folder("Enemies"), folder("Effects")
folder("Ice")
local rgb = Color3.fromRGB
local V = Vector3.new
local function part(parent,name,size,pos,color,mat,collide,shape)
	local p = Instance.new("Part")
	p.Name=name; p.Size=size; p.CFrame=typeof(pos)=="CFrame" and pos or CFrame.new(pos)
	p.Anchored=true; p.CanCollide=collide~=false; p.Color=color; p.Material=mat or Enum.Material.SmoothPlastic
	if shape then p.Shape=shape end
	p.TopSurface=Enum.SurfaceType.Smooth; p.BottomSurface=Enum.SurfaceType.Smooth
	p.Parent=parent; return p
end
local function model(parent,name)
	local m=Instance.new("Model",parent); m.Name=name; return m
end
local function ball(parent,name,size,pos,color)
	return part(parent,name,size,pos,color,Enum.Material.SmoothPlastic,false,Enum.PartType.Ball)
end
local base = W:FindFirstChild("Baseplate")
if base and base:IsA("BasePart") then base.Position=V(0,-12,0) end
for _, child in ipairs(W:GetChildren()) do if child:IsA("SpawnLocation") then child.Enabled=false end end
SP.CameraMode=Enum.CameraMode.LockFirstPerson
SP.CharacterWalkSpeed=16
L.ClockTime=15.8; L.Brightness=2.3; L.Ambient=rgb(110,123,136); L.OutdoorAmbient=rgb(136,148,156)
local atmosphere=Instance.new("Atmosphere",L); atmosphere.Name="AldoriaV2Atmosphere"; atmosphere.Density=.25; atmosphere.Haze=1.5; atmosphere.Color=rgb(221,235,216); atmosphere.Decay=rgb(135,160,169)
local bloom=Instance.new("BloomEffect",L); bloom.Name="AldoriaV2Bloom"; bloom.Intensity=.18; bloom.Size=24; bloom.Threshold=1.5
local sun=Instance.new("SunRaysEffect",L); sun.Intensity=.045
local grass=rgb(82,121,66); local stone=rgb(116,119,108); local wood=rgb(105,71,48)
local function ground(name,x,width)
	part(world,name,V(width,2,152),V(x,-1,0),grass,Enum.Material.Grass)
end
ground("WestBank",-39,78); ground("EastBank",48,68)
part(world,"RiverBed",V(14,1,152),V(7,-1.3,0),rgb(83,105,106),Enum.Material.Slate)
local water=part(world,"River",V(14,.14,152),V(7,-.12,0),rgb(59,154,177),Enum.Material.Glass,false)
water.Transparency=.25; water.Reflectance=.1
part(world,"RoadWest",V(68,.13,7),V(-34,.05,12),rgb(182,167,133),Enum.Material.Cobblestone)
part(world,"RoadEast",V(55,.13,7),V(41.5,.05,12),rgb(182,167,133),Enum.Material.Cobblestone)
for i=0,15 do part(world,"BridgePlank",V(.96,.5,7.5),V(i-.5,.2,12),wood,Enum.Material.WoodPlanks) end
for _,z in ipairs({8,16}) do
	part(world,"BridgeRail",V(16,.25,.3),V(7,2,z),wood,Enum.Material.Wood)
	for _,x in ipairs({-.5,4,10,14.5}) do part(world,"RailPost",V(.3,2.4,.3),V(x,1.2,z),wood,Enum.Material.Wood) end
end
local rng=Random.new(1748)
local function house(x,z,tint,roof)
	local m=model(world,"Maison de Brune")
	part(m,"Foundation",V(12,.6,11),V(x,.3,z),stone,Enum.Material.Slate)
	part(m,"Walls",V(11,7,10),V(x,3.8,z),tint,Enum.Material.Plaster)
	for _,dx in ipairs({-5.3,5.3}) do for _,dz in ipairs({-4.9,4.9}) do part(m,"Beam",V(.35,7,.35),V(x+dx,3.8,z+dz),wood,Enum.Material.Wood) end end
	for _,side in ipairs({-1,1}) do
		part(m,"Roof",V(7,.5,12),CFrame.new(x+side*2.9,8.35,z)*CFrame.Angles(0,0,math.rad(-side*29)),roof,Enum.Material.Slate)
	end
	part(m,"Door",V(2.1,3.9,.2),V(x,2.2,z+5.11),wood,Enum.Material.Wood,false)
	for _,dx in ipairs({-3.5,3.5}) do
		part(m,"WindowFrame",V(2.2,2.2,.22),V(x+dx,4.4,z+5.13),wood,Enum.Material.Wood,false)
		part(m,"Window",V(1.7,1.7,.24),V(x+dx,4.4,z+5.27),rgb(255,215,132),Enum.Material.Neon,false)
	end
	part(m,"Chimney",V(1.5,4,1.5),V(x+3,8.7,z-2),stone,Enum.Material.Brick)
end
house(-49,-12,rgb(218,198,154),rgb(109,65,56))
house(-31,-12,rgb(203,191,160),rgb(65,92,109))
house(-62,24,rgb(227,208,166),rgb(118,72,49))
house(-25,29,rgb(191,183,148),rgb(79,98,94))
local function lantern(x,z)
	part(world,"LampPost",V(.35,5,.35),V(x,2.5,z),wood,Enum.Material.Wood)
	local p=part(world,"Lantern",V(.7,.9,.7),V(x,5.15,z),rgb(255,190,85),Enum.Material.Neon,false)
	local light=Instance.new("PointLight",p); light.Color=p.Color; light.Range=15; light.Brightness=1.8
end
for _,x in ipairs({-64,-47,-30,-12,24}) do lantern(x,7.8) end
local function sign(name,pos)
	local p=part(world,name,V(3.2,1.6,.4),pos,wood,Enum.Material.Wood)
	local gui=Instance.new("BillboardGui",p); gui.Size=UDim2.fromOffset(220,48); gui.StudsOffset=V(0,1.6,0); gui.MaxDistance=38
	local label=Instance.new("TextLabel",gui); label.Size=UDim2.fromScale(1,1); label.BackgroundTransparency=1; label.Text=name; label.Font=Enum.Font.GothamBold; label.TextColor3=rgb(255,239,183); label.TextStrokeTransparency=.35; label.TextScaled=true
	return p
end
sign("Hameau de Brune",V(-52,2.6,7))
sign("Bois de Saule",V(23,2.6,6))
local fountain=part(world,"Source",V(8,1,8),V(-39,.5,0),stone,Enum.Material.Slate)
local basin=part(world,"Eau de source",V(6,.25,6),V(-39,1.1,0),rgb(78,203,222),Enum.Material.Glass)
local gem=ball(world,"Eclat",V(1.5,2.1,1.5),V(-39,3,0),rgb(155,226,255)); gem.Material=Enum.Material.Neon
local source=Instance.new("ProximityPrompt",basin); source.Name="SourcePrompt"; source.ActionText="Se ressourcer"; source.ObjectText="Source aux étoiles"; source.KeyboardKeyCode=Enum.KeyCode.F; source.HoldDuration=0; source.MaxActivationDistance=10; source.RequiresLineOfSight=false
local forge=part(world,"Forge",V(7,3,5),V(-19,1.5,-5),stone,Enum.Material.Brick)
local ember=part(world,"Braises",V(3,.3,2.7),V(-19,3.2,-5),rgb(255,119,46),Enum.Material.Neon,false)
local fire=Instance.new("Fire",ember); fire.Size=4; fire.Heat=8
sign("Brom · Armurier",V(-19,5.1,-5))
local armory=Instance.new("ProximityPrompt",forge); armory.Name="ArmoryPrompt"; armory.ActionText="Épée / Arc"; armory.ObjectText="Brom"; armory.KeyboardKeyCode=Enum.KeyCode.F; armory.MaxActivationDistance=10; armory.RequiresLineOfSight=false
local spawn=Instance.new("SpawnLocation"); spawn.Name="AldoriaSpawn"; spawn.Size=V(5,.25,5); spawn.Position=V(-39,.2,12); spawn.Anchored=true; spawn.Transparency=1; spawn.Neutral=true; spawn.Duration=0; spawn.Parent=world
local function tree(x,z,scale)
	local m=model(trees,"Saule")
	local h=6*scale
	local trunk=part(m,"Trunk",V(1.4*scale,h,1.4*scale),V(x,h/2,z),wood,Enum.Material.Wood)
	m.PrimaryPart=trunk
	for i=1,3 do
		local dx=(i-2)*1.5*scale; local dy=1.5*scale*(i==2 and 1 or 0)
		ball(m,"Leaves",V(5.5,5.1,5.7)*scale,V(x+dx,h+dy,z),rgb(47+12*i,100+13*i,54+5*i))
	end
	m:SetAttribute("Burning",false); m:SetAttribute("Burnt",false)
end
for i=1,62 do
	local x=rng:NextNumber(20,77); local z=rng:NextNumber(-69,69)
	if math.abs(z-12)>8 and (V(x,0,z)-V(33,0,0)).Magnitude>7 then tree(x,z,rng:NextNumber(.8,1.4)) end
end
for _,v in ipairs({{-70,-40},{-66,-49},{-62,-40},{-12,-28},{-8,-34},{-67,53},{-57,53},{-49,49},{-13,50},{-9,43},{22,29},{26,34}}) do tree(v[1],v[2],rng:NextNumber(.85,1.2)) end
for i=1,70 do
	local x=rng:NextNumber(-74,78); local z=rng:NextNumber(-70,70)
	if (x<0 or x>14) and math.abs(z-12)>7 and not(x<-12 and z>-20 and z<37) then
		local b=part(world,"Grass",V(.16,rng:NextNumber(.5,1.1),.16),CFrame.new(x,.45,z)*CFrame.Angles(0,0,rng:NextNumber(-.35,.35)),rgb(111,157,79),Enum.Material.Grass,false); b.CanQuery=false
		if i%6==0 then local flower=ball(world,"Flower",V(.35,.25,.35),V(x,.95,z),rgb(236,199,114)); flower.CanQuery=false end
	end
end
for i=1,38 do
	local z=-74+i*4; local x=i%2==0 and -77 or 80
	local rock=part(world,"Cliff",V(rng:NextNumber(7,12),rng:NextNumber(8,17),rng:NextNumber(7,13)),CFrame.new(x,4,z)*CFrame.Angles(0,rng:NextNumber(0,3),rng:NextNumber(-.18,.18)),stone,Enum.Material.Slate)
end
for _,z in ipairs({-74,74}) do
	for x=-70,74,10 do
		if x<0 or x>14 then part(world,"Hills",V(12,rng:NextNumber(8,16),9),CFrame.new(x,4,z)*CFrame.Angles(0,rng:NextNumber(-.2,.2),rng:NextNumber(-.2,.2)),rgb(104,111,101),Enum.Material.Slate) end
	end
end
local function wolf(x,z)
	local m=model(mobs,"Loup cendré")
	local p=V(x,1.8,z); local coat=rgb(85,94,105)
	local body=part(m,"Body",V(1.5,1.35,2.6),p,coat,Enum.Material.SmoothPlastic,false)
	m.PrimaryPart=body
	ball(m,"Head",V(1.25,1.25,1.3),p+V(0,.35,-1.55),coat)
	part(m,"Muzzle",V(.78,.54,.85),p+V(0,.08,-2.16),rgb(129,131,132),nil,false)
	for _,side in ipairs({-1,1}) do
		part(m,"Ear",V(.32,.68,.38),CFrame.new(p+V(side*.41,1.06,-1.49))*CFrame.Angles(0,0,side*.18),coat,nil,false)
		local e=ball(m,"Eye",V(.17,.18,.17),p+V(side*.45,.45,-2.02),rgb(255,180,69)); e.Material=Enum.Material.Neon
	end
	for _,side in ipairs({-1,1}) do for _,endZ in ipairs({-1,1}) do
		part(m,"Leg",V(.33,1.3,.4),p+V(side*.52,-1,endZ*.85),coat,nil,false)
	end end
	part(m,"Tail",V(.38,.4,1.35),CFrame.new(p+V(0,.25,1.73))*CFrame.Angles(-.35,0,0),coat,nil,false)
	m:SetAttribute("HP",100); m:SetAttribute("MaxHP",100)
	local gui=Instance.new("BillboardGui",body); gui.Name="Health"; gui.Size=UDim2.fromOffset(112,29); gui.StudsOffset=V(0,2.3,0); gui.MaxDistance=35; gui.AlwaysOnTop=false
	local label=Instance.new("TextLabel",gui); label.Name="NameLabel"; label.BackgroundTransparency=1; label.Size=UDim2.new(1,0,0,18); label.Font=Enum.Font.GothamBold; label.Text=m.Name; label.TextColor3=rgb(245,231,207); label.TextSize=12; label.TextStrokeTransparency=.2
	local bg=Instance.new("Frame",gui); bg.Name="Bar"; bg.BackgroundColor3=rgb(32,27,29); bg.BorderSizePixel=0; bg.Position=UDim2.new(0,8,0,20); bg.Size=UDim2.new(1,-16,0,5)
	local fill=Instance.new("Frame",bg); fill.Name="Fill"; fill.BackgroundColor3=rgb(178,58,56); fill.BorderSizePixel=0; fill.Size=UDim2.fromScale(1,1)
end
wolf(33,0); wolf(48,31)
local remote=Instance.new("RemoteEvent",RS); remote.Name="AldoriaV2Remote"
local server=Instance.new("Script"); server.Name="AldoriaV2Server"; server.Parent=SS
editor:UpdateSourceAsync(server,function() return [==[
local Players=game:GetService("Players")
local RS=game:GetService("ReplicatedStorage")
local Run=game:GetService("RunService")
local Tween=game:GetService("TweenService")
local root=workspace:WaitForChild("AldoriaV2")
local world,trees,mobs,fx=root.World,root.Trees,root.Enemies,root.Effects
local iceFolder=root:WaitForChild("Ice")
local remote=RS:WaitForChild("AldoriaV2Remote")
local V=Vector3.new
local states={}
local function now() return workspace:GetServerTimeNow() end
local function setup(p)
	p:SetAttribute("Stars",0); p:SetAttribute("Weapon","Epée")
	p:SetAttribute("GuardUntil",0); p:SetAttribute("DodgeUntil",0)
	for i=1,4 do p:SetAttribute("Ready"..i,0) end
	p:SetAttribute("DodgeReady",0)
	states[p]={attack=0,charge=0}
	p.CharacterAdded:Connect(function(c)
		local h=c:WaitForChild("Humanoid"); h.MaxHealth=120; h.Health=120
		p:SetAttribute("GuardUntil",0); p:SetAttribute("DodgeUntil",0)
	end)
	if p.Character then local h=p.Character:FindFirstChildOfClass("Humanoid"); if h then h.MaxHealth=120; h.Health=120 end end
end
Players.PlayerAdded:Connect(setup); Players.PlayerRemoving:Connect(function(p) states[p]=nil end)
for _,p in ipairs(Players:GetPlayers()) do setup(p) end
local function notice(p,s) remote:FireClient(p,"notice",s) end
local function living(p)
	local c=p.Character; local h=c and c:FindFirstChildOfClass("Humanoid"); local head=c and c:FindFirstChild("Head")
	if h and h.Health>0 and head and c.PrimaryPart then return c,h,head end
end
local function ray(origin,dir,exclude)
	local params=RaycastParams.new(); params.FilterType=Enum.RaycastFilterType.Exclude; params.FilterDescendantsInstances=exclude or {fx}; params.IgnoreWater=false
	return workspace:Raycast(origin,dir,params)
end
local function orb(pos,size,col)
	local p=Instance.new("Part"); p.Shape=Enum.PartType.Ball; p.Size=V(size,size,size); p.Position=pos; p.Color=col; p.Material=Enum.Material.Neon; p.Anchored=true; p.CanCollide=false; p.CanQuery=false; p.CanTouch=false; p.Parent=fx
	local l=Instance.new("PointLight",p); l.Color=col; l.Range=12; l.Brightness=1.7
	return p
end
local function burst(pos,col,size)
	local p=orb(pos,.7,col); p.Transparency=.2
	Tween:Create(p,TweenInfo.new(.3),{Size=V(size,size,size),Transparency=1}):Play()
	task.delay(.32,function() p:Destroy() end)
end
local function damage(m,n,p)
	if not m or not m.Parent then return end
	local hp=m:GetAttribute("HP") or 0; if hp<=0 then return end
	hp=math.max(0,hp-n); m:SetAttribute("HP",hp)
	local body=m.PrimaryPart; if body then
		local bar=body:FindFirstChild("Health"); if bar then bar.Bar.Fill.Size=UDim2.fromScale(hp/100,1) end
		burst(body.Position+V(0,.6,0),Color3.fromRGB(255,91,67),2.6)
	end
	if hp<=0 then
		if p and p.Parent==Players then p:SetAttribute("Stars",(p:GetAttribute("Stars") or 0)+1); notice(p,"Loup vaincu · +1 étoile") end
		m:Destroy()
	end
end
local function ancestor(part,container)
	local m=part and part:FindFirstAncestorOfClass("Model")
	return m and m.Parent==container and m or nil
end
local function ignite(m,depth)
	if not m or not m.Parent or m:GetAttribute("Burning") or m:GetAttribute("Burnt") then return end
	m:SetAttribute("Burning",true)
	local trunk=m.PrimaryPart; local pos=trunk.Position
	local flame=Instance.new("Fire",trunk); flame.Size=10; flame.Heat=12
	local light=Instance.new("PointLight",trunk); light.Color=Color3.fromRGB(255,128,41); light.Range=15; light.Brightness=3
	task.delay(2.5,function()
		if depth<3 then for _,other in ipairs(trees:GetChildren()) do if other.PrimaryPart and (other.PrimaryPart.Position-pos).Magnitude<8.5 then ignite(other,depth+1) end end end
	end)
	task.delay(8,function()
		if not m.Parent then return end
		flame:Destroy(); light:Destroy(); m:SetAttribute("Burnt",true); m:SetAttribute("Burning",false)
		trunk.Color=Color3.fromRGB(50,43,41)
		for _,part in ipairs(m:GetChildren()) do if part.Name=="Leaves" then part:Destroy() end end
	end)
end
local function shot(p,origin,direction,magic,charge)
	local col=magic and Color3.fromRGB(255,123,38) or Color3.fromRGB(255,230,157)
	local projectile=orb(origin,magic and 1.3 or .27,col)
	local speed=magic and 65 or 115
	local travelled=0
	task.spawn(function()
		while projectile.Parent and travelled<125 do
			local dt=math.min(Run.Heartbeat:Wait(),.05)
			local d=direction*speed*dt
			local c=p.Character; local excluded={fx}; if c then table.insert(excluded,c) end
			local hit=ray(projectile.Position,d,excluded)
			if hit then
				local m=ancestor(hit.Instance,mobs)
				if m then damage(m,magic and 48 or (18+charge*32),p) end
				if magic then
					if hit.Instance.Parent==iceFolder then hit.Instance:Destroy(); notice(p,"La glace fond") end
					ignite(ancestor(hit.Instance,trees),0)
					for _,t in ipairs(trees:GetChildren()) do if t.PrimaryPart and (t.PrimaryPart.Position-hit.Position).Magnitude<4 then ignite(t,0) end end
				end
				burst(hit.Position,col,magic and 5 or 1.3); break
			end
			projectile.Position=projectile.Position+d; travelled=travelled+d.Magnitude
		end
		projectile:Destroy()
	end)
end
local function directionValid(d)
	return typeof(d)=="Vector3" and d.Magnitude>.95 and d.Magnitude<1.05 and d.X==d.X and d.Y==d.Y and d.Z==d.Z
end
local function cooldown(p,i,seconds)
	local key="Ready"..i; if now()<(p:GetAttribute(key) or 0) then return false end
	p:SetAttribute(key,now()+seconds); return true
end
local function waterPoint(origin,dir)
	if math.abs(dir.Y)<.025 then return nil end
	local t=(-.05-origin.Y)/dir.Y
	if t<0 or t>100 then return nil end
	local pos=origin+dir*t
	if pos.X>=0 and pos.X<=14 and math.abs(pos.Z)<=74 then return pos end
	return nil
end
world["Eau de source"].SourcePrompt.Triggered:Connect(function(p)
	local c,h=living(p); if c and (c.PrimaryPart.Position-world.Source.Position).Magnitude<=12 then h.Health=h.MaxHealth; notice(p,"La source restaure tes forces") end
end)
world.Forge.ArmoryPrompt.Triggered:Connect(function(p)
	local c=living(p); if c and (c.PrimaryPart.Position-world.Forge.Position).Magnitude<=13 then
		local name=p:GetAttribute("Weapon")=="Arc" and "Epée" or "Arc"; p:SetAttribute("Weapon",name); states[p].charge=0; notice(p,"Brom : "..name.." équipée")
	end
end)
remote.OnServerEvent:Connect(function(p,action,d)
	local c,h,head=living(p); local state=states[p]; if not c or not state then return end
	if action=="charge" then if p:GetAttribute("Weapon")=="Arc" then state.charge=now() end; return end
	if action=="cancel" then state.charge=0; return end
	if action=="dodge" then
		if now()<(p:GetAttribute("DodgeReady") or 0) or not directionValid(d) then return end
		p:SetAttribute("DodgeReady",now()+1.3); p:SetAttribute("DodgeUntil",now()+.32)
		local flat=V(d.X,0,d.Z); if flat.Magnitude<.1 then flat=c.PrimaryPart.CFrame.LookVector end
		c.PrimaryPart.AssemblyLinearVelocity=flat.Unit*43+V(0,4,0); return
	end
	if not directionValid(d) then return end
	local origin=head.Position; local dir=d.Unit
	if action=="attack" then
		if now()<state.attack then return end
		local bow=p:GetAttribute("Weapon")=="Arc"; state.attack=now()+(bow and .48 or .78)
		if bow then
			if state.charge<=0 then return end
			local charge=math.clamp((now()-state.charge)/1.4,0,1); state.charge=0
			shot(p,origin+dir*1.6,dir,false,charge)
		else
			for _,m in ipairs(mobs:GetChildren()) do
				local b=m.PrimaryPart
				if b then
					local diff=b.Position-origin
					if diff.Magnitude<=7 and diff.Magnitude>.1 and diff.Unit:Dot(dir)>.45 then
						local hit=ray(origin,diff,{c,fx})
						if hit and ancestor(hit.Instance,mobs)==m then damage(m,38,p) end
					end
				end
			end
		end
	elseif action=="skill1" then if cooldown(p,1,3.5) then shot(p,origin+dir*1.6,dir,true,0) end
	elseif action=="skill2" then
		local pos=waterPoint(origin,dir)
		if not pos then notice(p,"Vise la surface de la rivière"); return end
		if not cooldown(p,2,12) then return end
		local ice=Instance.new("Part"); ice.Name="Pont de glace"; ice.Size=V(14.8,.6,6); ice.Position=V(7,.05,pos.Z); ice.Anchored=true; ice.Color=Color3.fromRGB(145,221,245); ice.Material=Enum.Material.Ice; ice.Transparency=.2; ice.Parent=iceFolder
		burst(pos,ice.Color,5); notice(p,"Rivière gelée · 10 secondes")
		task.delay(10,function() if ice.Parent then ice:Destroy() end end)
	elseif action=="skill3" then
		local pos=waterPoint(origin,dir)
		if not pos then notice(p,"Vise la rivière pour conduire la foudre"); return end
		if not cooldown(p,3,7) then return end
		local col=Color3.fromRGB(174,217,255)
		for i=1,7 do burst(pos+V(math.random(-5,5),.3,math.random(-8,8)),col,4) end
		for _,m in ipairs(mobs:GetChildren()) do local b=m.PrimaryPart; if b and b.Position.X>=0 and b.Position.X<=14 and (V(b.Position.X,0,b.Position.Z)-V(pos.X,0,pos.Z)).Magnitude<=13 then damage(m,70,p) end end
		notice(p,"La foudre se propage dans l'eau")
	elseif action=="skill4" then
		if cooldown(p,4,9) then p:SetAttribute("GuardUntil",now()+2.2); burst(origin,Color3.fromRGB(212,188,104),4); notice(p,"Garde astrale · 2 secondes") end
	end
end)
local brains={}
local function hurt(p,h,n)
	if now()<(p:GetAttribute("DodgeUntil") or 0) then notice(p,"Esquive !"); return end
	if now()<(p:GetAttribute("GuardUntil") or 0) then n=n*.35 end
	h:TakeDamage(n)
end
local tickAI=0
Run.Heartbeat:Connect(function(dt)
	tickAI+=dt
	if tickAI<.045 then return end
	local step=math.min(tickAI,.1); tickAI=0
	for _,m in ipairs(mobs:GetChildren()) do
		local body=m.PrimaryPart
		if body then
			local b=brains[m]
			if not b then
				b={nextAttack=0,windup=0,phase=0,home=body.Position,legs={}}
				for _,leg in ipairs(m:GetChildren()) do if leg.Name=="Leg" then table.insert(b.legs,{part=leg,offset=body.CFrame:ToObjectSpace(leg.CFrame)}) end end
				brains[m]=b
			end
			local target,hum,character,dist
			local nearest=38
			for _,p in ipairs(Players:GetPlayers()) do local c,h=living(p); if c then
				local diff=c.PrimaryPart.Position-body.Position; local length=diff.Magnitude
				if length<nearest then local seen=ray(body.Position,diff,{m,fx}); if seen and seen.Instance:IsDescendantOf(c) then target,hum,character,dist=p,h,c,length; nearest=length end end
			end end
			local goal=target and character.PrimaryPart.Position or b.home
			local flat=V(goal.X-body.Position.X,0,goal.Z-body.Position.Z)
			local walking=false
			if b.windup>0 and now()>=b.windup then
				b.windup=0; b.nextAttack=now()+1.5
				body.Color=Color3.fromRGB(85,94,105)
				if target and dist<6 then hurt(target,hum,18) end
			end
			if target and dist<5.2 then
				if now()>=b.nextAttack and b.windup==0 then b.windup=now()+.55; body.Color=Color3.fromRGB(184,115,53) end
			elseif b.windup==0 and flat.Magnitude>1.5 then
				local dir=flat.Unit
				local block=ray(body.Position,dir*2.7,{m,fx})
				if block and (not character or not block.Instance:IsDescendantOf(character)) then
					local right=V(-dir.Z,0,dir.X)
					if not ray(body.Position,right*2.7,{m,fx}) then dir=right elseif not ray(body.Position,-right*2.7,{m,fx}) then dir=-right else dir=V(0,0,0) end
				end
				if dir.Magnitude>.5 then local pos=body.Position+dir*(target and 8.5 or 4)*step; m:PivotTo(CFrame.lookAt(pos,pos+dir)); walking=true end
			end
			if walking then b.phase+=step*14 end
			for i,leg in ipairs(b.legs) do leg.part.CFrame=body.CFrame*leg.offset*CFrame.Angles(walking and math.sin(b.phase+i*math.pi/2)*.48 or 0,0,0) end
		end
	end
	for m in pairs(brains) do if not m.Parent then brains[m]=nil end end
end)
]==] end)
local client=Instance.new("LocalScript"); client.Name="AldoriaV2Client"; client.Parent=SP.StarterPlayerScripts
editor:UpdateSourceAsync(client,function() return [==[
local Players=game:GetService("Players")
local RS=game:GetService("ReplicatedStorage")
local Run=game:GetService("RunService")
local UIS=game:GetService("UserInputService")
local p=Players.LocalPlayer
local remote=RS:WaitForChild("AldoriaV2Remote")
local V=Vector3.new
local rgb=Color3.fromRGB
local controls=require(p:WaitForChild("PlayerScripts"):WaitForChild("PlayerModule")):GetControls()
controls:Disable()
local gui=Instance.new("ScreenGui"); gui.Name="AldoriaV2HUD"; gui.ResetOnSpawn=false; gui.IgnoreGuiInset=true; gui.Parent=p:WaitForChild("PlayerGui")
local function label(name,text,pos,size,fontSize)
	local l=Instance.new("TextLabel",gui); l.Name=name; l.Text=text; l.Position=pos; l.Size=size; l.TextSize=fontSize or 15; l.Font=Enum.Font.GothamMedium; l.BackgroundTransparency=1; l.TextColor3=rgb(239,234,216); l.TextStrokeTransparency=.45; return l
end
local function panel(pos,size)
	local f=Instance.new("Frame",gui); f.Position=pos; f.Size=size; f.BackgroundColor3=rgb(15,26,29); f.BackgroundTransparency=.22; f.BorderSizePixel=0
	local corner=Instance.new("UICorner",f); corner.CornerRadius=UDim.new(0,7); return f
end
panel(UDim2.fromOffset(18,18),UDim2.fromOffset(260,105))
local title=label("Title","✦ ALDORIA · V2 / TEST",UDim2.fromOffset(30,26),UDim2.fromOffset(235,24),17); title.TextXAlignment=Enum.TextXAlignment.Left; title.TextColor3=rgb(228,202,137)
local hp=label("HP","",UDim2.fromOffset(30,51),UDim2.fromOffset(235,23),14); hp.TextXAlignment=Enum.TextXAlignment.Left
local healthBack=panel(UDim2.fromOffset(30,77),UDim2.fromOffset(235,10)); healthBack.BackgroundTransparency=0; healthBack.BackgroundColor3=rgb(52,36,39)
local fill=Instance.new("Frame",healthBack); fill.Size=UDim2.fromScale(1,1); fill.BorderSizePixel=0; fill.BackgroundColor3=rgb(173,66,61)
local stars=label("Stars","",UDim2.fromOffset(30,90),UDim2.fromOffset(235,24),14); stars.TextXAlignment=Enum.TextXAlignment.Left
local cross=label("Crosshair","+",UDim2.new(.5,-17,.5,-17),UDim2.fromOffset(34,34),24)
local hint=label("Hint","Explore Brune · F : source / armurier · ZQSD ou WASD · Espace : esquive",UDim2.new(.5,-310,0,24),UDim2.fromOffset(620,26),14)
local msg=label("Notice","",UDim2.new(.5,-250,.65,0),UDim2.fromOffset(500,36),17); msg.TextColor3=rgb(255,222,150)
local weapon=label("Weapon","",UDim2.new(.5,-180,1,-125),UDim2.fromOffset(360,25),14)
local bar=panel(UDim2.new(.5,-178,1,-97),UDim2.fromOffset(356,75))
local slots={}
local names={"FEU","GLACE","FOUDRE","GARDE"}
local cols={rgb(237,125,67),rgb(143,216,237),rgb(174,193,253),rgb(230,194,116)}
for i=1,4 do
	local l=label("Slot"..i,i.." · "..names[i],UDim2.new(.5,-172+(i-1)*88,1,-87),UDim2.fromOffset(82,54),13)
	l.BackgroundColor3=rgb(34,45,49); l.BackgroundTransparency=.14; l.TextColor3=cols[i]; l.TextWrapped=true
	local corner=Instance.new("UICorner",l); corner.CornerRadius=UDim.new(0,5); slots[i]=l
end
local noticeUntil=0
remote.OnClientEvent:Connect(function(event,s) if event=="notice" then msg.Text=s; noticeUntil=os.clock()+2.5 end end)
local function dir() return workspace.CurrentCamera.CFrame.LookVector end
local keys={[Enum.KeyCode.One]=1,[Enum.KeyCode.Two]=2,[Enum.KeyCode.Three]=3,[Enum.KeyCode.Four]=4}
local aim,charge,attackAt=0,0,-10
local function cancel()
	aim=0
	if charge>0 then charge=0; remote:FireServer("cancel") end
end
UIS.InputBegan:Connect(function(input,processed)
	if processed then return end
	if input.UserInputType==Enum.UserInputType.MouseButton2 then cancel(); return end
	if keys[input.KeyCode] then aim=keys[input.KeyCode]; return end
	if input.KeyCode==Enum.KeyCode.Space then
		local c=p.Character; local h=c and c:FindFirstChildOfClass("Humanoid")
		local d=h and h.MoveDirection or V(0,0,0); if d.Magnitude<.1 then d=dir() end
		remote:FireServer("dodge",d.Unit)
	elseif input.UserInputType==Enum.UserInputType.MouseButton1 and aim==0 then
		if p:GetAttribute("Weapon")=="Arc" then charge=os.clock(); remote:FireServer("charge")
		else attackAt=os.clock(); remote:FireServer("attack",dir()) end
	end
end)
UIS.InputEnded:Connect(function(input)
	local k=keys[input.KeyCode]
	if k and aim==k then aim=0; attackAt=os.clock(); remote:FireServer("skill"..k,dir()) end
	if input.UserInputType==Enum.UserInputType.MouseButton1 and charge>0 then
		charge=0; attackAt=os.clock(); remote:FireServer("attack",dir())
	end
end)
UIS.WindowFocusReleased:Connect(cancel)
p:GetAttributeChangedSignal("Weapon"):Connect(cancel)
local view,shown
local function build(name)
	if view then view:Destroy() end
	view=Instance.new("Model"); view.Name="AldoriaV2Viewmodel"; view.Parent=workspace.CurrentCamera
	local function piece(n,s,cf,col,mat)
		local a=Instance.new("Part"); a.Name=n; a.Size=s; a.CFrame=cf; a.Anchored=true; a.CanCollide=false; a.CanTouch=false; a.CanQuery=false; a.CastShadow=false; a.Color=col; a.Material=mat or Enum.Material.SmoothPlastic; a.Parent=view; return a
	end
	local root=piece("Pivot",V(.05,.05,.05),CFrame.new(),rgb(0,0,0)); root.Transparency=1; view.PrimaryPart=root
	piece("Glove",V(.32,.31,.52),CFrame.new(0,-.12,.18),rgb(92,62,46))
	if name=="Arc" then
		for i=-3,3 do
			local y=i*.22; local z=.09*y*y*5
			piece("Bow",V(.12,.29,.12),CFrame.new(0,y,z)*CFrame.Angles(math.rad(i*6),0,0),rgb(122,82,49),Enum.Material.Wood)
		end
		piece("String",V(.025,1.52,.025),CFrame.new(0,0,.24),rgb(226,216,180))
		piece("Arrow",V(.045,.045,1.2),CFrame.new(-.07,0,-.28),rgb(188,151,92),Enum.Material.Wood)
	else
		piece("Handle",V(.12,.52,.12),CFrame.new(0,.06,0),rgb(73,45,36),Enum.Material.Wood)
		piece("Guard",V(.53,.09,.16),CFrame.new(0,.33,0),rgb(204,166,83),Enum.Material.Metal)
		piece("Blade",V(.19,1.48,.065),CFrame.new(0,1.11,0),rgb(188,205,217),Enum.Material.Metal)
		piece("Edge",V(.035,1.45,.075),CFrame.new(.09,1.11,0),rgb(232,237,235),Enum.Material.Metal)
	end
	shown=name
end
local function down(...)
	for _,k in ipairs({...}) do if UIS:IsKeyDown(k) then return true end end
	return false
end
Run:BindToRenderStep("AldoriaV2Movement",Enum.RenderPriority.Input.Value+1,function()
	local c=p.Character; local h=c and c:FindFirstChildOfClass("Humanoid")
	if not h then return end
	local x=(down(Enum.KeyCode.D,Enum.KeyCode.Right) and 1 or 0)-(down(Enum.KeyCode.A,Enum.KeyCode.Q,Enum.KeyCode.Left) and 1 or 0)
	local z=(down(Enum.KeyCode.S,Enum.KeyCode.Down) and 1 or 0)-(down(Enum.KeyCode.W,Enum.KeyCode.Z,Enum.KeyCode.Up) and 1 or 0)
	local d=V(x,0,z); if d.Magnitude>1 then d=d.Unit end
	if UIS:GetFocusedTextBox() then d=V(0,0,0) end
	h:Move(d,true)
end)
Run:BindToRenderStep("AldoriaV2View",Enum.RenderPriority.Camera.Value+1,function()
	local c=p.Character; local h=c and c:FindFirstChildOfClass("Humanoid"); local cam=workspace.CurrentCamera
	if not cam or not h then return end
	local name=p:GetAttribute("Weapon") or "Epée"
	if not view or view.Parent~=cam or shown~=name then build(name) end
	local moving=h.MoveDirection.Magnitude>.1
	local bob=moving and math.sin(os.clock()*10)*.035 or 0
	local a=os.clock()-attackAt; local swing=(a<.45 and math.sin(a/.45*math.pi) or 0)
	local chargeRatio=charge>0 and math.clamp((os.clock()-charge)/1.4,0,1) or 0
	local offset=CFrame.new(.67,-.78+bob,-1.38+chargeRatio*.18)*CFrame.Angles(-.18-swing*.9,-.15-swing*.7,-.35+swing*.8)
	view:PivotTo(cam.CFrame*offset)
	hp.Text=string.format("Vie    %d / %d",math.ceil(h.Health),h.MaxHealth)
	fill.Size=UDim2.fromScale(math.clamp(h.Health/h.MaxHealth,0,1),1)
	stars.Text="✦ "..tostring(p:GetAttribute("Stars") or 0).." étoile(s)"
	local dodge=math.max(0,(p:GetAttribute("DodgeReady") or 0)-workspace:GetServerTimeNow())
	weapon.Text=name..(charge>0 and string.format(" · Charge %d%%",math.floor(chargeRatio*100)) or " · Clic gauche")..(dodge>0 and string.format(" · Esquive %.1fs",dodge) or " · Esquive prête")
	cross.Text=aim>0 and "⊕" or (chargeRatio>=1 and "✦" or "+"); cross.TextColor3=aim>0 and cols[aim] or rgb(239,234,216)
	for i=1,4 do
		local cd=math.max(0,(p:GetAttribute("Ready"..i) or 0)-workspace:GetServerTimeNow())
		slots[i].Text=i.." · "..names[i]..(cd>0 and string.format("\n%.1fs",cd) or (aim==i and "\nVISÉE" or "\nPRÊT"))
		slots[i].TextTransparency=cd>0 and .35 or 0
	end
	if os.clock()>noticeUntil then msg.Text="" end
end)
]==] end)
print("Aldoria V2 installé dans cette Baseplate. Clique sur Play/F5. Aucune publication automatique.")
