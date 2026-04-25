import os
from reportlab.platypus import SimpleDocTemplate, Table, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from PyQt6.QtPrintSupport import QPrintDialog, QPrinter
from PyQt6.QtGui import QTextDocument

def generar_pdf_prcc(prcc_data: dict, ruta_pdf: str) -> str:
    """Genera PDF de la PRCC con reportlab. Retorna ruta."""
    doc = SimpleDocTemplate(ruta_pdf, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    story.append(Paragraph(f"PLANILLA DE REGISTRO CADENA CUSTODIA", styles['Title']))
    story.append(Spacer(1, 12))
    
    for key, value in prcc_data.items():
        story.append(Paragraph(f"<b>{key}</b>: {value}", styles['Normal']))
        story.append(Spacer(1, 6))
        
    doc.build(story)
    return ruta_pdf

def imprimir_documento(html_content: str, parent_widget=None):
    """Abre diálogo de impresión Qt para cualquier contenido HTML."""
    printer = QPrinter(QPrinter.PrinterMode.HighResolution)
    dialog = QPrintDialog(printer, parent_widget)
    if dialog.exec() == QPrintDialog.DialogCode.Accepted:
        doc = QTextDocument()
        doc.setHtml(html_content)
        doc.print(printer)
