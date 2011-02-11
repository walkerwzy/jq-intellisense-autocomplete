<%@ WebHandler Language="C#" Class="ajaxHandler" %>

using System;
using System.Web;
using System.Text;
using System.Linq;
using System.Xml.Linq;

public class ajaxHandler : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        //context.Response.ContentType = "text/plain";
        //context.Response.Write("Hello World");

        switch (context.Request["act"])
        {
            case "hos":
                getHos(context);
                break;
            case "doc":
                getDoc(context);
                break;
            case "dept":
                getDept(context);
                break;
            case "spe":
                getSpe(context);
                break;
            default:
                break;
        }
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

    private void getHos(HttpContext context)
    {
        context.Response.Clear();
        context.Response.ContentType = "text/plain";

        //<data_row><hospital_id>100001</hospital_id><hospital_name>同济医院</hospital_name><input_code>TJYY</input_code></data_row><data_row>
        XDocument xdoc = XDocument.Load(context.Server.MapPath("hos.xml"));
        var q = xdoc.Root.Descendants("data_row");
        if (!string.IsNullOrEmpty(context.Request["v"]))
        {
            q = q.Where(t => (t.Element("hospital_name").Value.IndexOf(context.Request["v"]) > -1
                || t.Element("input_code").Value.ToUpper().IndexOf(context.Request["v"].ToUpper()) > -1)
            ).Select(t => t);
        }

        StringBuilder r = new StringBuilder("[");

        foreach (var item in q)
        {
            r.Append("[\"" + item.Element("hospital_id").Value + "\",\"" + item.Element("hospital_name").Value + "\",\"" + item.Element("input_code").Value + "\",\"\"]");
            if (((XNode)item).NextNode != null) r.Append(",");
        }


        r.Append("]");

        context.Response.Write(r.ToString());
        context.Response.End();
    }

    private void getDoc(HttpContext context)
    {
        context.Response.Clear();
        context.Response.ContentType = "text/plain";

        //<data_row><hospital_id>100001</hospital_id><dept_code>031203</dept_code><doctor_no>100454</doctor_no>
        //<doctor_name>曹颖光</doctor_name><input_code>CYG</input_code></data_row>
        XDocument xdoc = XDocument.Load(context.Server.MapPath("doc.xml"));
        var q = xdoc.Root.Descendants("data_row");
        if (!string.IsNullOrEmpty(context.Request["pid"]))
        {
            q = q.Where(t => t.Element("hospital_id").Value == context.Request["pid"]).Select(t => t);
        }
        if (!string.IsNullOrEmpty(context.Request["v"]))
        {
            q = q.Where(t => (t.Element("doctor_name").Value.IndexOf(context.Request["v"]) > -1
                || t.Element("input_code").Value.ToUpper().IndexOf(context.Request["v"].ToUpper()) > -1)
            ).Select(t => t);
        }

        StringBuilder r = new StringBuilder("[");

        foreach (var item in q)
        {
            r.Append("[\"" + item.Element("doctor_no").Value + "\",\"" + item.Element("doctor_name").Value + "\",\"" + item.Element("input_code").Value + "\",\"" + item.Element("hospital_id").Value + "\"]");
            if (((XNode)item).NextNode != null) r.Append(",");
        }


        r.Append("]");

        context.Response.Write(r.ToString());
        context.Response.End();
    }


    private void getDept(HttpContext context)
    {
        context.Response.Clear();
        context.Response.ContentType = "text/plain";

        //<data_row><hospital_id>100001</hospital_id><dept_code>030309</dept_code><dept_name>妇科—妇科</dept_name><input_code>FKFK</input_code></data_row>
        XDocument xdoc = XDocument.Load(context.Server.MapPath("dept.xml"));
        var q = xdoc.Root.Descendants("data_row");
        if (!string.IsNullOrEmpty(context.Request["pid"]))
        {
            q = q.Where(t => t.Element("hospital_id").Value == context.Request["pid"]).Select(t => t);
        }
        if (!string.IsNullOrEmpty(context.Request["v"]))
        {
            q = q.Where(t => (t.Element("dept_name").Value.IndexOf(context.Request["v"]) > -1
                || t.Element("input_code").Value.ToUpper().IndexOf(context.Request["v"].ToUpper()) > -1)
            ).Select(t => t);
        }


        StringBuilder r = new StringBuilder("[");

        foreach (var item in q)
        {
            r.Append("[\"" + item.Element("dept_code").Value + "\",\"" + item.Element("dept_name").Value + "\",\"" + item.Element("input_code").Value + "\",\"" + item.Element("hospital_id").Value + "\"]");
            if (((XNode)item).NextNode != null) r.Append(",");
        }


        r.Append("]");

        context.Response.Write(r.ToString());
        context.Response.End();
    }

    private void getSpe(HttpContext context)
    {
        context.Response.Clear();
        context.Response.ContentType = "text/plain";

        //<data_row><specialty></specialty><sp_input_code></sp_input_code></data_row>
        XDocument xdoc = XDocument.Load(context.Server.MapPath("spec.xml"));
        var q = xdoc.Root.Descendants("data_row");
        if (!string.IsNullOrEmpty(context.Request["v"]))
        {
            q = q.Where(t => (t.Element("specialty").Value.IndexOf(context.Request["v"]) > -1
                || t.Element("sp_input_code").Value.ToUpper().IndexOf(context.Request["v"].ToUpper()) > -1)
            ).Select(t => t);
        }

        StringBuilder r = new StringBuilder("[");

        foreach (var item in q)
        {
            r.Append("[\"\",\"" + item.Element("specialty").Value + "\",\"" + item.Element("sp_input_code").Value + "\",\"\"]");
            if (((XNode)item).NextNode != null) r.Append(",");
        }


        r.Append("]");

        context.Response.Write(r.ToString());
        context.Response.End();
    }
}