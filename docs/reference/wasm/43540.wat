  (func (;43540;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 4366817
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3345832
      call 2180
      i32.const 3356428
      call 2180
      i32.const 3388632
      call 2180
      i32.const 3388636
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3429544
      call 2180
      i32.const 3369324
      call 2180
      i32.const 3462916
      call 2180
      i32.const 4366817
      i32.const 1
      i32.store8
    end
    i32.const 3369324
    i32.load
    call 1900
    local.tee 3
    local.get 0
    i32.store offset=12
    local.get 0
    i32.load offset=36
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=40
      local.set 1
      i32.const 3360788
      i32.load
      local.tee 2
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 2
        call 60460
      end
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=36
      i32.const 1
      i32.const 0
      call 48833
      local.get 0
      i32.load offset=40
      i32.const 1
      i32.const 0
      call 48833
      local.get 3
      i32.const 0
      i32.store offset=8
      local.get 3
      i32.const 0
      i32.store offset=16
      local.get 0
      i32.load offset=32
      local.tee 2
      i32.load offset=12
      i32.const 0
      i32.gt_s
      if  ;; label = @2
        i32.const 0
        local.set 1
        loop  ;; label = @3
          local.get 2
          local.get 1
          local.get 5
          i32.const 12
          i32.add
          i32.const 3388636
          i32.load
          call 50458
          local.get 5
          i32.load offset=12
          local.set 2
          i32.const 3360788
          i32.load
          local.tee 4
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 4
            call 60460
          end
          block  ;; label = @4
            local.get 2
            i32.const 0
            i32.const 0
            call 48872
            br_if 0 (;@4;)
            local.get 3
            i32.load offset=20
            local.tee 4
            i32.eqz
            if  ;; label = @5
              i32.const 3345832
              i32.load
              call 1900
              local.tee 4
              local.get 3
              i32.const 3429544
              i32.load
              i32.const 0
              call 44667
              local.get 3
              local.get 4
              i32.store offset=20
            end
            local.get 2
            local.get 4
            local.get 1
            call 43541
            i32.eqz
            br_if 0 (;@4;)
            local.get 3
            local.get 3
            i32.load offset=16
            i32.const 1
            i32.add
            i32.store offset=16
          end
          local.get 1
          i32.const 1
          i32.add
          local.tee 1
          local.get 0
          i32.load offset=32
          local.tee 2
          i32.load offset=12
          i32.lt_s
          br_if 0 (;@3;)
        end
        local.get 3
        i32.load offset=16
        br_if 1 (;@1;)
      end
      i32.const 3356428
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      i32.const 3462916
      i32.load
      i32.const 0
      call 55817
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0)
