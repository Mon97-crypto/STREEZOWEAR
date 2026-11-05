import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
src,dst,prev=sys.argv[1:4]
im=Image.open(src).convert('RGB'); a=np.asarray(im).astype(float); L=a.mean(2)
bgrow=np.median(np.concatenate([L[:,:60],L[:,-60:]],1),1)[:,None]
fg=(bgrow-L)>14
fg=nd.binary_opening(fg,iterations=2)
lab,n=nd.label(fg); sizes=nd.sum(fg,lab,range(1,n+1)); fg=lab==(np.argmax(sizes)+1)
fg=nd.binary_fill_holes(nd.binary_closing(fg,iterations=6))
m=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.GaussianBlur(1.5))
out=im.copy(); out.putalpha(m); out.save(dst)
bg=Image.new('RGBA',im.size,(7,7,10,255)); bg.alpha_composite(out); bg.convert('RGB').resize((700,700)).save(prev)
