  (func (;44368;) (type 2) (param i32 i32 i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4367412
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3383748
      call 2180
      i32.const 3387092
      call 2180
      i32.const 3387100
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4367412
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store offset=8
    i32.const 3360788
    i32.load
    local.tee 3
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 3
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      i32.const 3375560
      i32.load
      local.set 3
      local.get 0
      i32.load offset=48
      local.set 4
      local.get 2
      local.get 1
      i32.load offset=72
      i32.store offset=12
      local.get 4
      local.get 2
      i32.const 12
      i32.add
      local.get 2
      i32.const 8
      i32.add
      local.get 3
      call 34286
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=8
      local.get 1
      i32.const 3387100
      i32.load
      call 50441
      i32.eqz
      if  ;; label = @2
        local.get 2
        i32.load offset=8
        local.get 1
        i32.const 3387092
        i32.load
        call 50463
      end
      local.get 1
      i32.load8_u offset=108
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.load offset=216
        local.get 1
        i32.const 3383748
        i32.load
        call 35536
        drop
      end
      i32.const 4367479
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3357352
        call 2180
        i32.const 4367479
        i32.const 1
        i32.store8
      end
      i32.const 3357352
      i32.load
      i32.load offset=92
      i32.load
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      local.get 0
      local.get 1
      i32.const 0
      call 40968
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0)
