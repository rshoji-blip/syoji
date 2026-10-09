import sys, csv
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule
from openpyxl.utils import get_column_letter as L
src, region, out = sys.argv[1:4]
phones={}
if len(sys.argv)>4:
    for no,nm,tel,conf,url,memo in csv.reader(open(sys.argv[4],encoding='utf-8'),delimiter='\t'):
        phones[int(no)]=dict(tel=tel,conf=conf,src=url,memo=memo)
PREF='北海道'
recs=[]
for name,addr,sid,course in csv.reader(open(src,encoding='utf-8'),delimiter='\t'):
    recs.append(dict(name=name,pref=PREF,city=addr[len(PREF):],url=f'https://www.gakkou.net/kou/view/index_{sid}.html',course=course))
F='Yu Gothic'
f=lambda **k:Font(name=F,size=k.pop('size',10),**k)
thin=Side(style='thin',color='BFBFBF'); B=Border(left=thin,right=thin,top=thin,bottom=thin)
HF=PatternFill('solid',fgColor='1F4E78'); IN=PatternFill('solid',fgColor='FFF2CC')
RESULTS=['未架電','不在・折返し待ち','担当者不在','資料送付','アポ獲得','検討中','NG','番号不明']
wb=Workbook(); ws=wb.active; ws.title='架電リスト'
ws['A1']=f'私立高等学校 架電リスト（{region}／{len(recs)}校）'; ws['A1'].font=f(size=14,bold=True)
ws['A2']=('出典：学校ネット 私立高校検索結果（ご提供の貼り付けデータ）。電話番号は2026年10月にWeb検索で調査（出典・確度はM〜N列）。架電前に「確度：中・低」の番号は念のためご確認ください。' if phones else '出典：学校ネット 私立高校検索結果（ご提供の貼り付けデータ）。電話番号は元データに記載がないため空欄です。黄色の列に入力してください。'); ws['A2'].font=f(size=9,color='595959')
H=['No.','都道府県','所在地（市区町村）','学校名','電話番号','番号の確度','学科','架電日','担当者','架電結果','次回連絡日','メモ','電話番号の補足','電話番号の出典','学校情報ページ']
W=[6,10,18,38,15,9,16,12,12,16,12,30,46,40,12]
hr=4
for c,(h,w) in enumerate(zip(H,W),1):
    x=ws.cell(hr,c,h); x.font=f(bold=True,color='FFFFFF'); x.fill=HF; x.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True); x.border=B
    ws.column_dimensions[L(c)].width=w
CONF={'高':'C6EFCE','中':'FFEB9C','低':'FFC7CE'}
for n,r in enumerate(recs,1):
    row=hr+n; ph=phones.get(n,{})
    vals=[n,r['pref'],r['city'],r['name'],ph.get('tel') or None,ph.get('conf') or None,r['course'],None,None,'未架電',None,None,ph.get('memo') or None,ph.get('src') or None,'開く']
    for c,v in enumerate(vals,1):
        x=ws.cell(row,c,v); x.font=f(); x.border=B; x.alignment=Alignment(vertical='center',wrap_text=c in(13,14))
        if c in(8,9,10,11,12) or (c==5 and not v): x.fill=IN
    ws.cell(row,1).alignment=Alignment(horizontal='center',vertical='center')
    cf=ws.cell(row,6); cf.alignment=Alignment(horizontal='center',vertical='center')
    if cf.value in CONF: cf.fill=PatternFill('solid',fgColor=CONF[cf.value])
    if not ph.get('tel') and phones: ws.cell(row,5).value=None; ws.cell(row,6).value='要調査'; ws.cell(row,6).fill=PatternFill('solid',fgColor='FFC7CE')
    ws.cell(row,14).font=f(size=8,color='595959'); ws.cell(row,13).font=f(size=9)
    l=ws.cell(row,15); l.hyperlink=r['url']; l.font=f(color='0563C1',underline='single'); l.alignment=Alignment(horizontal='center',vertical='center')
    ws.cell(row,5).number_format='@'
    for c in(8,11): ws.cell(row,c).number_format='yyyy/mm/dd'
last=hr+len(recs)
ws.freeze_panes=f'F{hr+1}'
ws.auto_filter.ref=f'A{hr}:{L(len(H))}{last}'
dv=DataValidation(type='list',formula1='"'+','.join(RESULTS)+'"',allow_blank=True); ws.add_data_validation(dv); dv.add(f'J{hr+1}:J{last}')
dd=DataValidation(type='date',operator='greaterThan',formula1='36526',allow_blank=True,errorTitle='日付',error='日付で入力してください（例：2026/10/9）')
ws.add_data_validation(dd); dd.add(f'H{hr+1}:H{last}'); dd.add(f'K{hr+1}:K{last}')
ws.conditional_formatting.add(f'A{hr+1}:{L(len(H))}{last}',FormulaRule(formula=[f'$J{hr+1}="アポ獲得"'],fill=PatternFill('solid',fgColor='C6EFCE')))
ws.conditional_formatting.add(f'A{hr+1}:{L(len(H))}{last}',FormulaRule(formula=[f'$J{hr+1}="NG"'],fill=PatternFill('solid',fgColor='D9D9D9'),font=Font(color='808080')))
ws.print_title_rows=f'{hr}:{hr}'; ws.page_setup.orientation='landscape'; ws.page_setup.fitToWidth=1; ws.page_setup.fitToHeight=0; ws.sheet_properties.pageSetUpPr.fitToPage=True
# summary by city (most schools first)
s=wb.create_sheet('市区町村別集計')
s['A1']='市区町村別 進捗集計（架電リストの入力に連動して自動計算）'; s['A1'].font=f(size=14,bold=True)
SH=['所在地','学校数','電話番号入力済','架電済']+RESULTS[1:]
for c,h in enumerate(SH,1):
    x=s.cell(3,c,h); x.font=f(bold=True,color='FFFFFF'); x.fill=HF; x.border=B; x.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True)
    s.column_dimensions[L(c)].width=18 if c==1 else 11
s.row_dimensions[3].height=30
R=lambda col:f"'架電リスト'!${col}${hr+1}:${col}${last}"
cities=[]
for r in recs:
    if r['city'] not in cities: cities.append(r['city'])
first=list(cities); cities.sort(key=lambda c:(-sum(r['city']==c for r in recs),first.index(c)))
for i,cty in enumerate(cities):
    row=4+i; s.cell(row,1,cty)
    s.cell(row,2,f'=COUNTIF({R("C")},A{row})')
    s.cell(row,3,f'=COUNTIFS({R("C")},A{row},{R("E")},"<>")')
    s.cell(row,4,f'=B{row}-COUNTIFS({R("C")},A{row},{R("J")},"未架電")-COUNTIFS({R("C")},A{row},{R("J")},"")')
    for k,res in enumerate(RESULTS[1:]):
        s.cell(row,5+k,f'=COUNTIFS({R("C")},$A{row},{R("J")},"{res}")')
tr=4+len(cities); s.cell(tr,1,'合計')
for c in range(2,len(SH)+1): s.cell(tr,c,f'=SUM({L(c)}4:{L(c)}{tr-1})')
for row in s.iter_rows(min_row=4,max_row=tr,max_col=len(SH)):
    for x in row:
        x.font=f(bold=(x.row==tr)); x.border=B
        if x.row==tr: x.fill=PatternFill('solid',fgColor='DDEBF7')
s.freeze_panes='B4'
n=wb.create_sheet('使い方・注意事項')
notes=['■ 使い方',
'・「架電リスト」の黄色の列（電話番号・架電日・担当者・架電結果・次回連絡日・メモ）に入力してください。',
'・架電結果はプルダウンから選択します（アポ獲得＝緑、NG＝グレーで行が自動着色）。',
'・「学校情報ページ」の「開く」をクリックすると、学校ネットの各校ページが開きます。',
'・「番号の確度」：高＝公式サイト、または2つ以上の情報源で一致／中＝情報サイト1件のみで確認／低・要調査＝特定できず。',
'・「電話番号の補足」に、代表番号の共有・別番号（入試事務局など）・移転などの注意を記載しています。架電前にご確認ください。',
'・市区町村で絞り込む場合は、見出し行「所在地（市区町村）」の▼（フィルター）を使用してください。',
'・「市区町村別集計」は入力内容に連動して自動で集計されます（学校数の多い順）。',
'',
'■ 元データについての注意',
f'・出典：ご提供いただいた学校ネットの検索結果（私立高校・{region}、{len(recs)}校）の貼り付けデータ。並び順は元データの掲載順です。',
('・電話番号は元データに記載がないため、2026年10月にWeb検索（学校公式サイト、JS日本の学校、みんなの高校情報、自治体・ハローワーク・道私学協会の資料など）で調査しました。推測による補完はしていません。' if phones else '・元データには電話番号の記載がないため、電話番号欄は空欄です。'),
'・クラーク記念国際・星槎国際など広域通信制の学校は、所在地が本校のみの表記です。架電先（本校／各キャンパス）にご注意ください。',
'・閉校・統合・校名変更などは反映されていない可能性があります。架電前にご確認ください。']
for i,t in enumerate(notes,1):
    x=n.cell(i,1,t); x.font=f(bold=t.startswith('■'),size=11 if t.startswith('■') else 10)
n.column_dimensions['A'].width=120
wb.save(out)
