  (func (;43174;) (type 2) (param i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4366536
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3360788
      call 2180
      i32.const 3456380
      call 2180
      i32.const 4366536
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=16
    local.set 2
    i32.const 3360788
    i32.load
    local.tee 4
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 4
      call 60460
    end
    block  ;; label = @1
      local.get 2
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.const 0
      i32.store8 offset=25
      local.get 1
      if  ;; label = @2
        local.get 0
        i32.load offset=16
        i32.const 0
        call 48706
        br_if 1 (;@1;)
        local.get 0
        i32.const 1
        i32.store8 offset=24
        local.get 0
        i32.load offset=16
        i32.const 1
        i32.const 0
        call 48707
        local.get 0
        i32.load offset=16
        i32.const 3456380
        i32.load
        i32.const 0
        f32.const 0x0p+0 (;=0;)
        i32.const 0
        call 20996
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      i32.store8 offset=24
      local.get 0
      i32.load offset=16
      i32.const 0
      call 48706
      if  ;; label = @2
        local.get 0
        i32.load offset=16
        i32.const 0
        i32.const 0
        call 48707
      end
      local.get 0
      i32.load offset=28
      local.tee 2
      if  ;; label = @2
        local.get 0
        local.get 2
        i32.const 0
        call 48892
        local.get 0
        i32.const 0
        i32.store offset=28
      end
      local.get 0
      i32.const 0
      call 48735
      local.set 0
      i32.const 4377531
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3364792
        call 2180
        i32.const 4377531
        i32.const 1
        i32.store8
      end
      local.get 3
      i32.const 3364792
      i32.load
      i32.load offset=92
      local.tee 2
      i32.load offset=20
      i32.store offset=8
      local.get 3
      local.get 2
      i64.load offset=12 align=4
      i64.store
      local.get 0
      local.get 3
      i32.const 0
      call 49495
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
